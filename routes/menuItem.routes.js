const router=require("express").Router()
const MenuItemController=require("../controllers/menuItem.controller")
const upload=require("../middlewares/upload")  


router.get("/", MenuItemController.list)
router.post("/add", upload.single("image"),MenuItemController.add)
router.put("/update/:id", upload.single("image")  ,MenuItemController.update)
router.delete("/delete/:id",MenuItemController.delete)
router.get("/:id", MenuItemController.view)
router.get("/search",MenuItemController.search)
module.exports=router;