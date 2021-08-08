const express = require('express')
const { addCategory, getCategory, deleteCategory, updateCategory } = require('../controller/category')
const router = express.Router()

router.post("/categories", addCategory)
router.get("/categories", getCategory)
router.delete("/categories/:id", deleteCategory)
router.patch("/categories/:id", updateCategory)


module.exports = router