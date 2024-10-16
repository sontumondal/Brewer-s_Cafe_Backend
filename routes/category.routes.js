
const router = require("express").Router();
const authController=require("../controllers/admin.controller")
const CategoryController = require("../controllers/category.controller");
const uploadsingle = require("../middlewares/uploadsingle");

// Route to render the add category form
router.get("/", authController.protect, CategoryController.addForm);
router.get("/list",CategoryController.list)
    
// Route to render the update category form
router.get("/edit/:id", CategoryController.edit);

// Route to handle adding a new category
router.post("/add", uploadsingle.single("image"), CategoryController.add);

// Route to handle updating an existing category
router.post("/update/:id", uploadsingle.single("image"), CategoryController.update);

// Route to handle deleting a category
router.get("/delete/:id", CategoryController.delete);

// Route to get menu items by category
router.get("/:id",CategoryController.getMenuItemsByCategory)
module.exports = router;
