const CategoryModel = require("../models/category.model");
const MenuItem = require("../models/menuItem.model"); // Import the MenuItem model

class CategoryController {
  // Render form to add a new category
  async addForm(req, res) {
    try {
      res.render("categories/add", {
        title: "Category Management",
      });
    } catch (error) {
      res
        .status(500)
        .render("error", { message: "Failed to render add category form" });
      console.log("category form error", error);
    }
  }

  // Render Category List
  async list(req, res) {
    try {
      const category = await CategoryModel.find({ isDeleted: false });

      if (
        req.headers["accept"] === "application/json" ||
        req.query.api === "true"
      ) {
        // Send JSON response
        return res.status(200).json({
          success: true,
          message: "Categories fetched successfully",
          category,
        });
      }
      res.render("categories/list", {
        title: "Categories List",
        category,
      });
    } catch (error) {
      if (
        req.headers["accept"] === "application/json" ||
        req.query.api === "true"
      ) {
        // Send JSON error response
        return res.status(500).json({
          success: false,
          message: "Failed to fetch category list",
          error: error.message,
        });
      }
      res
        .status(500)
        .render("error", { message: "Failed to render category list" });
      console.log("category list error", error);
    }
  }

  // New method: Fetch menu items by category ID
  async getMenuItemsByCategory(req, res) {
    try {
      const { id } = req.params; // Category ID
      const { limit = 10, skip = 0 } = req.query;

      // Find the category by ID
      const category = await CategoryModel.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Fetch menu items by category ID with pagination
      const totalItems = await MenuItem.countDocuments({ category: id });
      const menuItems = await MenuItem.find({ category: id })
        .skip(Number(skip))
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        message: "Menu items fetched successfully",
        menuItems,
        totalItems,
        currentPage: Math.floor(Number(skip) / Number(limit)) + 1,
        totalPages: Math.ceil(totalItems / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while fetching menu items",
      });
    }
  }


  async edit(req, res) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return res
          .status(404)
          .render("error", { message: "Category not found" });
      }
      res.render("categories/update", {
        title: "Category Update",
        category,
      });
    } catch (error) {
      res
        .status(500)
        .render("error", { message: "Failed to render update category form" });
      console.log("Update form error", error);
    }
  }

  async add(req, res) {
    try {
      const { name, description } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      const category = await CategoryModel.create({
        name,
        image,
        description,
        isDeleted: false,
      });
      res.status(201).redirect("/api/categories/list");
    } catch (error) {
      res.status(500).render("error", { message: "Failed to add category" });
      console.log("Category add error", error);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : undefined;
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { name, image, description },
        { new: true }
      );
      if (!category) {
        return res
          .status(404)
          .render("error", { message: "Category not found" });
      }
      res.status(200).redirect("/api/categories/list");
    } catch (error) {
      res.status(500).render("error", { message: "Failed to update category" });
      console.log("Category update error", error);
    }
  }

  async delete(req, res) {
    try {
      // Update the category's isDeleted field to true instead of deleting the record
      const deletedData = await CategoryModel.findByIdAndUpdate(req.params.id, {
        isDeleted: true,
      });

      if (deletedData) {
        return res.redirect("/api/categories/list");
      } else {
        return res
          .status(404)
          .render("error", { message: "Category not found" });
      }
    } catch (error) {
      res.status(500).render("error", { message: "Failed to delete category" });
      console.log("Category delete error", error);
    }
  }
}

module.exports = new CategoryController();
