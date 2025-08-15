const Category = require("../models/Category");
const Product = require("../models/Product");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description, categoryImageUrl,bannerImageUrl } = req.body;

    const exists = await Category.findOne({ category_name });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ category_name, description, categoryImageUrl,bannerImageUrl });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Categories with Product Count
exports.getCategoriesWithProductCount = async (req, res) => {
  try {
    const categories = await Category.find();

    const results = await Promise.all(categories.map(async (category) => {
      const count = await Product.countDocuments({ category: category._id });
      return {
        ...category._doc,
        productCount: count
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const count = await Product.countDocuments({ category: category._id });

    res.json({ ...category._doc, productCount: count });
  } catch (err) {
    console.log(({ message: err.message }))
    res.status(500).json({ message: err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    let { filters, ...rest } = req.body;
    console.log(Category.schema.paths.filters);


    // ✅ If filters comes as a string (multipart/form-data), parse it
    if (typeof filters === "string") {
      try {
        filters = JSON.parse(filters.replace(/'/g, '"')); // replace single quotes with double quotes
      } catch (err) {
        console.error("Invalid filters format:", filters);
        return res.status(400).json({ message: "Invalid filters JSON format" });
      }
    }

    if (!Array.isArray(filters)) {
      filters = [];
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { ...rest, filters },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update only subpageType of a category
exports.updateCategorySubpageType = async (req, res) => {
  try {
    const { subpageType } = req.body;
    console.log(subpageType);
    
      if (typeof subpageType === "string" && subpageType.toLowerCase() === "none") {
      subpageType = null;
    }

    if (typeof subpageType !== "string") {
      return res.status(400).json({ message: "subpageType must be a string" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { subpageType },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (err) {
    console.error("Error updating subpageType:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get category by subpageType
exports.getCategoryBySubpageType = async (req, res) => {
  try {
    const { subpageType } = req.params;

    if (!subpageType) {
      return res.status(400).json({ message: "subpageType is required" });
    }

    const category = await Category.findOne({ subpageType });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error("Error fetching category by subpageType:", err);
    res.status(500).json({ message: err.message });
  }
};


// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
