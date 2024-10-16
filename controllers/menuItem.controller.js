const MenuItem = require("../models/menuItem.model");
const Category = require("../models/category.model");
class MenuItemController {
  async addForm(req, res) {
    try {
      const categories = await Category.find();
      res.render("menuitems/add", {
        title: "MenuItem Management",
        categories,
      });
    } catch (error) {
      console.log("menutitem addform error", error);
      res
        .status(500)
        .render("error", { message: "Error fetching menu items addform." });
    }
  }

  // List all menu items (both for EJS view and API)
  async list(req, res) {
    try {
      const menuItems = await MenuItem.find({ isDeleted: false }).populate(
        "category"
      );

      // Check if it's an API request or render EJS
      if (req.headers.accept.includes("application/json")) {
        return res.status(200).json({
          success: true,
          message: "Menu-items fetch successfully",
          menuItems,
        });
      }

      // Render EJS view
      res.render("menuItems/list", {
        title: "MenuItems List ",
        menuItems,
      });
    } catch (error) {
      console.error("Error fetching menu items:", error);

      if (req.headers.accept.includes("application/json")) {
        return res
          .status(500)
          .json({ success: false, message: "Error fetching menu items." });
      }

      res
        .status(500)
        .render("error", { message: "Error fetching menu items." });
    }
  }

  // Add menu item (both for EJS form submission and API)
  async add(req, res) {
    const { name, price, discount, description, ingredients, categoryId } =
      req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category ID." });
      }
      const menuItem = new MenuItem({
        name,
        price,
        ingredients,
        discount,
        category: categoryId,
        description,
        image,
        isDeleted: false,
      });
      await menuItem.save();

      if (req.headers.accept.includes("application/json")) {
        return res
          .status(201)
          .json({ success: true, message: "Menu item added successfully!" });
      }

      // Redirect to menu item list after successful addition
      res.redirect("/api/menu-items/list");
    } catch (error) {
      console.error("Error adding menu item:", error);

      if (req.headers.accept.includes("application/json")) {
        return res
          .status(500)
          .json({ success: false, message: "Error adding menu item." });
      }

      res.status(500).render("error", { message: "Error adding menu item." });
    }
  }
  // edit page

  async edit(req, res) {
    try {
      // Find the menu item by ID
      const menuItem = await MenuItem.findById(req.params.id);
      if (!menuItem) {
        return res
          .status(404)
          .render("error", { message: "Menu item not found." });
      }

      // Fetch the list of categories
      const categories = await Category.find(); // Fetch all categories

      // Render the update page and pass both menuItem and categories
      res.render("menuItems/update", {
        title: "MenuItem Update",
        menuItem,
        categories, // Pass categories to the template
      });
    } catch (error) {
      console.log("menuitems edit error", error);
      res.status(500).render("error", { message: "Error editing menu item." });
    }
  }

  // Update menu item (both for EJS form submission and API)
  async update(req, res) {
    const { id } = req.params;
    const { name, price, description, discount, ingredients, categoryId } =
      req.body;
    // const image = req.file
    //   ? req.file.map((file) => `/uploads/${file.filename}`)
    //   : undefined;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      // Find the menu item by ID
      const menuItem = await MenuItem.findById(id);
      if (!menuItem) {
        return res
          .status(404)
          .render("error", { message: "Menu item not found." });
      }

      // Find the category by ID to ensure it's valid (optional, depends on use case)
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid category ID." });
        }
        menuItem.category = categoryId; // Update the category if it's valid
      }

      // Update the menu item fields
      menuItem.name = name || menuItem.name;
      menuItem.price = price || menuItem.price;
      menuItem.description = description || menuItem.description;
      menuItem.discount = discount || menuItem.discount;
      menuItem.ingredients = ingredients || menuItem.ingredients;
      menuItem.image = image || menuItem.image;

      // Save the updated menu item
      await menuItem.save();

      // Check if it's an API request or EJS form submission
      if (req.headers.accept.includes("application/json")) {
        return res
          .status(200)
          .json({ success: true, message: "Menu item updated successfully!" });
      }

      // Redirect to the list page if it's not an API request
      res.redirect("/api/menu-items/list");
    } catch (error) {
      console.error("Error updating menu item:", error);

      // Handle API errors
      if (req.headers.accept.includes("application/json")) {
        return res
          .status(500)
          .json({ success: false, message: "Error updating menu item." });
      }

      // Render error page for EJS form submissions
      res.status(500).render("error", { message: "Error updating menu item." });
    }
  }

  // Soft delete menu item (both for EJS and API)
  async delete(req, res) {
    try {
      const menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );
      if (!menuItem) {
        return res
          .status(404)
          .render("error", { message: "Menu item not found." });
      }

      if (req.headers.accept.includes("application/json")) {
        return res
          .status(200)
          .json({ success: true, message: "Menu item deleted successfully!" });
      }

      res.redirect("/api/menu-items/list");
    } catch (error) {
      console.error("Error deleting menu item:", error);

      if (req.headers.accept.includes("application/json")) {
        return res
          .status(500)
          .json({ success: false, message: "Error deleting menu item." });
      }

      res.status(500).render("error", { message: "Error deleting menu item." });
    }
  }

  // View menu item details
  async view(req, res) {
    const { id } = req.params;

    try {
      const menuItem = await MenuItem.findById(id).populate("category");
      if (!menuItem) {
        return res
          .status(404)
          .render("error", { message: "Menu item not found." });
      }

      // Check if it's an API request or render EJS
      if (req.headers.accept.includes("application/json")) {
        return res.status(200).json({ success: true, menuItem });
      }

      res.render("menuItems/view", {
        title: "Single Menu",
        menuItem,
      });
    } catch (error) {
      console.error("Error fetching menu item details:", error);
      res
        .status(500)
        .render("error", { message: "Error fetching menu item details." });
    }
  }

  // Search for menu items
  async search(req, res) {
    const query = req.query.query || ""; // Ensure query is defined

    try {
      const menuItems = await MenuItem.find({
        name: { $regex: query, $options: "i" },
      }).populate("category");

      if (req.headers.accept.includes("application/json")) {
        return res.status(200).json({
          success: true,
          message: "Menu-items and search fetch successfully",
          menuItems,
        });
      }

      // Render the view with the query and menuItems
      res.render("menuItems/list", {
        title: "MenuItems Search and List",
        menuItems,
        query,
      });
    } catch (error) {
      console.error("Error searching menu items:", error);
      res
        .status(500)
        .render("error", { message: "Error searching menu items." });
    }
  }
 

// Controller method for searching menu items with pagination and flexible search
searchMenuItems = async (req, res) => {
  try {
    const { q, id, limit = 10, skip = 0 } = req.query;

    // Build the search query
    let query = {};

    // Search by name or description if a query is provided
    if (q) {
      query = {
        ...query,
        $or: [
          { name: { $regex: q, $options: 'i' } }, // Case-insensitive search for name
          { description: { $regex: q, $options: 'i' } }, // Case-insensitive search for description
        ],
      };
    }

    // Filter by category ID if provided
    if (id) {
      query = {
        ...query,
        category: id, // Assuming menu item has a `category` field
      };
    }

    // Fetch total count of menu items (for pagination metadata)
    const totalItems = await MenuItem.countDocuments(query);

    // Fetch the menu items with pagination (limit and skip)
    const menuItems = await MenuItem.find(query)
      .skip(Number(skip))
      .limit(Number(limit));

    // Return the paginated response along with total items and total pages
    res.json({
      menuItems,
      totalItems,
      currentPage: Math.floor(Number(skip) / Number(limit)) + 1,
      totalPages: Math.ceil(totalItems / Number(limit)),
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: "Server error while fetching menu items" });
  }
};



}

module.exports = new MenuItemController();



//  searchMenuItems = async (req, res) => {
  //     const { q, id } = req.query;

//     // Build the search query for filtering by name or description
//     let query = {};
//     if (q) {
//       query = {
//         ...query,
//         $or: [
//           { name: { $regex: q, $options: 'i' } }, // Case-insensitive search for name
//           { description: { $regex: q, $options: 'i' } }, // Case-insensitive search for description
//         ],
//       };
//     }

//     // Add filtering by category ID if provided
//     if (id) {
//       query = {
//         ...query,
//         category: id, // Assuming menu item has a `category` field
//       };
//     }

//     // Fetch the menu items matching the query
//     const menuItems = await MenuItem.find(query);
    
//     res.status(200).json({ menuItems });
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error });
//   }
// };
//   try {

 // async searchcategoryandmenu(req, res) {
  //   const { query = "", category = "" } = req.query;

  //   try {
  //     // Build the query object
  //     const searchCriteria = { isDeleted: false };

  //     if (query) {
  //       searchCriteria.name = { $regex: query, $options: "i" }; // Search by name
  //     }

  //     if (category) {
  //       searchCriteria.category = category; // Filter by category if provided
  //     }

  //     // Fetch the menu items based on the search criteria
  //     const menuItems =
  //       await MenuItem.find(searchCriteria).populate("category");

  //     // Respond with JSON if requested
  //     if (req.headers.accept.includes("application/json")) {
  //       return res.status(200).json({
  //         success: true,
  //         message: "Menu items fetched successfully",
  //         menuItems,
  //       });
  //     }

  //     // Render view if not requested as JSON
  //     // res.render("menuItems/list", {
  //     //   title: "Menu Items Search and List",
  //     //   menuItems,
  //     //   query,
  //     //   category,
  //     // });
  //   } catch (error) {
  //     console.error("Error searching menu items:", error);
  //     // res
  //     //   .status(500)
  //     //   .render("error", { message: "Error searching menu items." });
  //   }
  // }

  // Controller to handle search by category and query

// const MenuItem = require('../models/MenuItem');

// // Controller method for searching menu items with pagination
// exports.searchMenuItems = async (req, res) => {
//   try {
//     const { q, id, limit = 10, skip = 0 } = req.query;

//     // Build the search query
//     const searchQuery = {
//       categoryId: id,  // Filter by category
//       name: { $regex: q, $options: 'i' },  // Search by name (case-insensitive)
//     };

//     // Fetch total count of menu items (for pagination metadata)
//     const totalItems = await MenuItem.countDocuments(searchQuery);

//     // Fetch the menu items with pagination (limit and skip)
//     const menuItems = await MenuItem.find(searchQuery)
//       .skip(Number(skip))
//       .limit(Number(limit));

//     // Return the paginated response
//     res.json({
//       menuItems,
//       totalItems,
//       currentPage: Math.floor(Number(skip) / Number(limit)) + 1,
//       totalPages: Math.ceil(totalItems / Number(limit)),
//     });
//   } catch (error) {
//     console.error("Error fetching menu items:", error);
//     res.status(500).json({ error: "Server error while fetching menu items" });
//   }
// };

//   const MenuItem = require('../models/MenuItem');