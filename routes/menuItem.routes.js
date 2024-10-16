const router=require("express").Router()
const MenuItemController=require("../controllers/menuItem.controller")
const upload=require("../middlewares/upload")  
const authController=require("../controllers/admin.controller")

router.get("/", authController.protect ,MenuItemController.addForm)
// Route to list menu items
router.get("/list", MenuItemController.list);

// Route to view a single menu item
router.get("/view/:id", MenuItemController.view);

// Route to add a new menu item (renders the form or handles API request)
router.post("/add", upload.single("image"), MenuItemController.add);

// Route to update an existing menu item
router.get("/edit/:id",MenuItemController.edit)
router.post("/update/:id", upload.single("image"), MenuItemController.update);

// Route to delete a menu item (soft delete)
router.get("/delete/:id", MenuItemController.delete);

// Route to search menu items
router.get("/search", MenuItemController.search);
// router.get("/searching",MenuItemController.searchcategoryandmenu)
router.get("/searched",MenuItemController.searchMenuItems)

module.exports=router;

// router.get("/", MenuItemController.list)
// router.post("/add", upload.single("image"),MenuItemController.add)
// router.put("/update/:id", upload.single("image")  ,MenuItemController.update)
// router.delete("/delete/:id",MenuItemController.delete)
// router.get("/:id", MenuItemController.view)
// router.get("/search",MenuItemController.search)