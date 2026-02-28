const Product = require('../models/Product');
const Category = require("../models/Category");
const Review = require('../models/Review');
const mongoose = require("mongoose")

// 🔥 COMMON FILTER BUILDER
const buildProductFilter = async (req) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    color,
    searchQuery,
    page,
    limit,
    sortBy,
    random,
    ...dynamicFilters
  } = req.query;

  const query = {};

  // Category
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.category = new mongoose.Types.ObjectId(category);
  }

  // Brand
  if (brand) {
    query.brand = { $regex: new RegExp(`^${brand}$`, "i") }; // Exact match but case insensitive
  }

  // Color inside variant
  if (color) {
    query["variant.title"] = { $regex: new RegExp(`^${color}$`, "i") };
  }

  // Price inside variant.sizes
  if (minPrice || maxPrice) {
    query["variant.sizes.sellingPrice"] = {};
    if (minPrice) {
      query["variant.sizes.sellingPrice"].$gte = Number(minPrice);
    }
    if (maxPrice) {
      query["variant.sizes.sellingPrice"].$lte = Number(maxPrice);
    }
  }

  // Search
  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i");
    query.$or = [
      { name: { $regex: regex } },
      { brand: { $regex: regex } },
    ];
  }

  // Dynamic Filters mapped to tech_spec
  const techSpecQueries = [];

  for (const [key, val] of Object.entries(dynamicFilters)) {
    if (!val) continue;

    // We skip keys starting with min_ or max_ for now as range filters 
    // over strings inside MongoDB requires complex parsing not suitable here
    if (key.startsWith("min_") || key.startsWith("max_")) continue;

    const valuesArray = val.split(",").map((v) => new RegExp(`(^| |[^a-zA-Z0-9])${v.trim()}([^a-zA-Z0-9] | |$)`, "i"));

    // We want tech_spec array to contain at least ONE element that matches
    // Title = the key, Value = IN the values requested
    techSpecQueries.push({
      tech_spec: {
        $elemMatch: {
          title: new RegExp(`^${key}$`, "i"),
          value: { $in: valuesArray },
        },
      },
    });
  }

  if (techSpecQueries.length > 0) {
    if (query.$and) {
      query.$and.push(...techSpecQueries);
    } else {
      query.$and = techSpecQueries;
    }
  }

  return query;
};

// @desc Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user._id,
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// @desc Get all products with pagination, filtering, and sorting (with optional random)
// @desc Get all products with pagination + advanced filtering
exports.getAllProducts = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy,
    random,
  } = req.query;

  try {
    const query = await buildProductFilter(req);

    const size = parseInt(limit);
    const pageNumber = parseInt(page);
    const skipAmount = (pageNumber - 1) * size;

    const pipeline = [];

    // 🔹 1. MATCH (Filtering happens FIRST)
    pipeline.push({ $match: query });

    // 🔹 2. Random products
    if (random === "true") {
      pipeline.push({ $sample: { size } });
    }

    // 🔹 3. Reviews lookup
    pipeline.push(
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $avg: "$reviews.rating" }, 0],
          },
        },
      },
      { $project: { reviews: 0 } }
    );

    // 🔹 4. Category + User lookup
    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "frontusers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$createdBy",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // 🔹 5. Sorting
    if (sortBy) {
      const [field, order] = sortBy.split(":");
      pipeline.push({
        $sort: { [field]: order === "asc" ? 1 : -1 },
      });
    }

    // 🔹 6. Pagination (AFTER FILTERING)
    if (random !== "true") {
      pipeline.push({ $skip: skipAmount });
      pipeline.push({ $limit: size });
    }

    // Execute
    const products = await Product.aggregate(pipeline);

    // Count total after filters
    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / size),
        currentPage: pageNumber,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


// @desc Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('createdBy', 'name email');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Update a product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// @desc Get products by category (with pagination)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const filterQuery = await buildProductFilter(req);

    // Force category filter from params
    filterQuery.category = new mongoose.Types.ObjectId(categoryId);

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // 🔥 FILTER FIRST
    const totalProducts = await Product.countDocuments(filterQuery);

    const products = await Product.find(filterQuery)
      .populate("category")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    console.error("Category filter error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.shareProductLink = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const shareLink = `https://https://knobsshop.store/${product._id}`;

    return res.status(200).json({ shareLink });
  } catch (error) {
    console.error("Error generating share link:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// @desc Get products by brand name (case-insensitive, handles spaces, etc.)
exports.getProductsByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const filterQuery = await buildProductFilter(req);

    // Force brand from params
    filterQuery.brand = { $regex: new RegExp(brandName.trim(), "i") };

    const totalProducts = await Product.countDocuments(filterQuery);

    const products = await Product.find(filterQuery)
      .populate("category")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    console.error("Brand filter error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.searchProductsByParam = async (req, res) => {
  const { query } = req.params;
  const { page = 1, limit = 12 } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search query required" });
  }

  try {
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const categories = await Category.find({
      category_name: { $regex: query, $options: "i" },
    }).select("_id");

    const categoryIds = categories.map((cat) => cat._id);

    const filterQuery = await buildProductFilter(req);

    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { brand: { $regex: query, $options: "i" } },
      { category: { $in: categoryIds } },
      { productId: { $regex: query, $options: "i" } },
    ];

    const totalProducts = await Product.countDocuments(filterQuery);

    const products = await Product.find(filterQuery)
      .populate("category")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
