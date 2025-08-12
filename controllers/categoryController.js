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
    res.status(500).json({ message: err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    console.log("Received payload:", req.body);
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (err) {
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
