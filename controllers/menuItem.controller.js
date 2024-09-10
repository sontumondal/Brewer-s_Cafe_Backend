// const MenuItem=require("../models/menuItem.model")

// class MenuItemController{
// async list(req,res){
//     try {
//         const menuItem=await MenuItem.find().populate("category")
//         res.status(200).json({menuItem})
//     } catch (error) {
//         console.log("menuitem list error",error)
//     }
// }

// async add(req,res){
//     try {
//         const { name ,price, description, categoryId} = req.body;
//         const image=req.file ?`/uploads/${req.file.filename}` : undefined;
//         const menuItem=await MenuItem.create({
//             name,
//             price,
//             description,
//             category:categoryId,
//             image
//         })
//         res.status(201).json({menuItem})
//     } catch (error) {
//         console.log("menuitem add error",error)
//     }
// }

// async update(req,res){
//     const {id}=req.params;
//     const {name, price,description, categoryId} =req.body;
//     const image =req.file ? `/uploads/${req.file.filename}` : undefined;
//     const menuItem=await MenuItem.findByIdAndUpdate(id , {
//         name,price,description,category:categoryId,image
//     },{
//         new:true
//     })
// res.status(200).json({menuItem})
// }

// async delete(req,res){
//     const {id} =req.params;
//     await MenuItem.findByIdAndDelete(id)
//     res.status(200).json({message:"MenuItem Deleted Successfully !"})
// }

// }
// module.exports=new MenuItemController()


const MenuItem = require("../models/menuItem.model");

class MenuItemController {
  async list(req, res) {
    try {
      const menuItems = await MenuItem.find().populate("category");
      res.status(200).json({ menuItems });
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching menu items." });
    }
  }

  async add(req, res) {
    const { name, price, description, categoryId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const menuItem = new MenuItem({
        name,
        price,
        category: categoryId,
        description,
        image,
      });
      await menuItem.save();
      res
        .status(201)
        .json({ success: true, message: "Menu item added successfully!" });
    } catch (error) {
      console.error("Error adding menu item:", error);
      res
        .status(500)
        .json({ success: false, message: "Error adding menu item." });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, price, description, categoryId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const menuItem = await MenuItem.findById(id);
      if (!menuItem) {
        return res
          .status(404)
          .json({ success: false, message: "Menu item not found." });
      }

      menuItem.name = name || menuItem.name;
      menuItem.price = price || menuItem.price;
      menuItem.category = categoryId || menuItem.category;
      menuItem.description = description || menuItem.description;
      menuItem.image = image || menuItem.image;

      await menuItem.save();
      res
        .status(200)
        .json({ success: true, message: "Menu item updated successfully!" });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating menu item." });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const menuItem = await MenuItem.findByIdAndDelete(id);
      if (!menuItem) {
        return res
          .status(404)
          .json({ success: false, message: "Menu item not found." });
      }

      res
        .status(200)
        .json({ success: true, message: "Menu item deleted successfully!" });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting menu item." });
    }
  }

  // View details of a specific menu item
  async view(req, res) {
    const { id } = req.params;

    try {
      const menuItem = await MenuItem.findById(id).populate("category");
      if (!menuItem) {
        return res
          .status(404)
          .json({ success: false, message: "Menu item not found." });
      }
      res.status(200).json({ menuItem });
    } catch (error) {
      console.error("Error fetching menu item details:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching menu item details." });
    }
  }

  // Search menu items
  async search(req, res) {
    const { query } = req.query;

    try {
      const menuItems = await MenuItem.find({
        name: { $regex: query, $options: "i" },
      }).populate("category");
      res.status(200).json({ menuItems });
    } catch (error) {
      console.error("Error searching menu items:", error);
      res
        .status(500)
        .json({ success: false, message: "Error searching menu items." });
    }
  }
}

module.exports = new MenuItemController();
