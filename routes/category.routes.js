const router=require("express").Router()
const CategoryController=require("../controllers/category.controller")
const upload=require("../middlewares/upload")
router.get("/",CategoryController.list)
router.post("/add", upload.single("image"), CategoryController.add);
router.put("/update/:id", upload.single("image"), CategoryController.update);
router.delete("/delete/:id", CategoryController.delete)

module.exports=router;