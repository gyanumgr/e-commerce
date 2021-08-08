const Product = require("../models/product");
const Category = require("../models/category");
const mongoose = require("mongoose");

exports.newProduct = async (req, res) => {

  const file = req.file
  if(!file){
    return res.status(400).send({msg:"no image in the request"})
  }
  const fileName = req.file.filename
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

  const newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    price: req.body.price,
    category: req.body.category,
    isFeatured: req.body.isFeatured
  });
  await newProduct.save();
  res.send(newProduct);
};

exports.getProducts = async (req, res) => {
  const products = await Product.find()
    .select("name category isFeatured")
    .populate("category");

  if (!products)
    return res
      .status(400)
      .json({ success: false, message: "couldnt get the product" });
  res.status(200).send(products);
};

exports.getSingle = async (req, res) => {
  const singleProduct = await Product.findById(req.body.id);
  if (!singleProduct)
    return res.status(400).json({ message: "invalid category" });
  res.status(200).send(singleProduct);
};

exports.updateProduct = async (req, res) => {
  if (!monggose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "invalid product id" });
  }
  const category = await Category.findById(req.body.category);
  if (!category)
    return res.status(400).json({ message: "this product have no category" });

  const update = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      price: req.body.price,
      category: req.body.category,
    },
    { new: true }
  );
  const newProduct = await update.save();
  if (!newProduct) {
    return res.status(400).json({ success: false, message: "couldnt update" });
  }
  res.status(201).send(newProduct);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product)
    return res.status(400).json({ success: false, message: "cant delete" });
  res.status(200).json({ success: true, message: "deleted" });
};

exports.countProduct = async (req, res) => {
  const countProduct = await Product.countDocuments((count) => count);
  if (!countProduct) {
    res.status(500).json({ success: false });
  }
  res.status(200).json({
    countProduct: countProduct,
  });
};

exports.getFeatured = async (req,res)=>{
    const count = req.params.count ? req.params.count :0
    const featured = await Product.find({isFeatured: true}).limit(+count)
    if(!featured){
        res.status(500).json({sucess:false})
    }
    res.send(featured)
}

exports.getCategoryWise = async (req,res)=>{
    //localhost:3000/api/v1/product?categories=1234453242
    let filter = {}
    if(req.query.categories){
        filter = { category: req.query.categories.split(',')}
    }
    const productList =  await Product.find(filter).populate('category')
    if(!productList){
        res.status(500).json({sucess:false})
    }
    res.send(productList)
}
