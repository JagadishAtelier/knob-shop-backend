const Product = require('../models/Product');
const Category = require("../models/Category");
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
exports.getAllProducts = async (req, res) => {
  const { page = 1, limit, sortBy, category, searchQuery, random } = req.query;

  const query = {};
  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }
    query.category = category;
  }

  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i");
    query.$or = [{ name: { $regex: regex } }, { brand: { $regex: regex } }];
  }

  try {
    let products, totalProducts;

    if (random === "true") {
      // 🎲 Randomized products
      const size = limit ? parseInt(limit) : 20; // default random size
      products = await Product.aggregate([
        { $match: query },
        { $sample: { size } },
      ]);
      totalProducts = await Product.countDocuments(query);
    } else {
      // Normal query + sorting
      const sortOptions = {};
      if (sortBy) {
        const [field, order] = sortBy.split(":");
        sortOptions[field] = order === "asc" ? 1 : -1;
      }

      totalProducts = await Product.countDocuments(query);

      if (limit) {
        // Apply pagination only if limit is provided
        products = await Product.find(query)
          .sort(sortOptions)
          .skip((parseInt(page) - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .populate("category")
          .populate("createdBy", "name email");
      } else {
        // No limit → fetch all
        products = await Product.find(query)
          .sort(sortOptions)
          .populate("category")
          .populate("createdBy", "name email");
      }
    }

    res.json({
      success: true,
      data: products,
      pagination: limit
        ? {
            totalProducts,
            totalPages: Math.ceil(totalProducts / parseInt(limit)),
            currentPage: parseInt(page),
          }
        : null, // no pagination if limit not provided
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
// @desc Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`Fetching products for category ID: ${categoryId}`);
    

    const products = await Product.find({ category: categoryId })
      .populate('category') // Populate category details

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this category.' });
    }

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
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

    // Create a case-insensitive regex to match the brand name
    const regex = new RegExp(brandName.trim(), 'i'); // no ^ and $


    const products = await Product.find({ brand: { $regex: regex } })
      .populate('category')
      .populate('createdBy', 'name email');

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this brand.' });
    }

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


exports.searchProductsByParam = async (req, res) => {
  const { query } = req.params; // or req.query if using ?query=...

  if (!query || query.trim() === "") {
    return res.status(400).json({ success: false, message: "Search query is required" });
  }

  try {
    // Find matching categories
    const categories = await Category.find({
      category_name: { $regex: query, $options: "i" },
    }).select("_id");

    const categoryIds = categories.map((cat) => cat._id);

    // Find products by name, category, or brand
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $in: categoryIds } },
        { productId: { $regex: query, $options: "i" } },
      ],
    })
      .populate("category")
      .populate("createdBy", "name email");

    res.status(200).json({ success: true, results: products });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
