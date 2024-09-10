const Category = require("../models/category.model");

class CategoryController {
  async list(req, res) {
    try {
      const categories = await Category.find();
      res.status(200).json({ categories });
    } catch (error) {
      res.status(401).json({ message: "Failed to load categories" });
      console.log("Category list error", error);
    }
  }

  async add(req, res) {
    try {
      const { name } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : undefined; // Handle image upload
      const category = await Category.create({ name, image });
      res.status(201).json({ category });
    } catch (error) {
      console.log("Category add error", error);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : undefined; // Handle image update
      const category = await Category.findByIdAndUpdate(
        id,
        { name, image },
        { new: true }
      );
      res.status(200).json({ category });
    } catch (error) {
      console.log("Category update error", error);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await Category.findByIdAndDelete(id);
      res.status(200).json({ message: "Category Deleted Successfully!" });
    } catch (error) {
      console.log("Category delete error", error);
    }
  }
}

module.exports = new CategoryController();
