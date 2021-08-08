const express = require('express')
const { newProduct, getProducts, updateProduct, getSingle, deleteProduct, countProduct, getFeatured, getCategoryWise } = require('../controller/product')
const router = express.Router()
const auth = require('../middleware/auth')
const authJwt  =require('../helpers/jwt')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'

}
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error("invalid file type")

        if(isValid){
          uploadError = null
        }

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension} `)
    }
  })
   
  var upload = multer({ storage: storage })


router.post("/product", upload.single('image'), newProduct)
router.get("/product", getProducts)
router.patch("/product/:id", updateProduct)
router.get("/product/:id", getSingle)
router.delete("/product/:id", deleteProduct)
router.get(`/product/get/count`, countProduct)
router.get("/product/get/featured/:count", getFeatured)
router.get("/product", getCategoryWise)

module.exports = router