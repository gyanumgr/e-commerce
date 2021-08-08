const ordersSchema = require("../models/orders");
const OrderItem = require("../models/order-items");

exports.getOrders = async (req, res) => {
  const orderList = await ordersSchema.find().populate("user", "-hashPassword");
  if (!orderList) {
    return res.status(500).send({ success: false });
  }
  res.status(200).send(orderList);
};

exports.getOrder = async (req, res) => {
  const order = await ordersSchema
    .findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });
  if (!order) {
    return res.status(500).send({ success: false });
  }
  res.status(200).send(order);
};

exports.newOrders = async (req, res) => {
  const arrIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItems = new OrderItem({
        product: orderItem.product,
        quantity: orderItem.quantity,
      });

      const newOrderItem1 = await newOrderItems.save();
      return newOrderItem1._id;
    })
  );

  const orderItemsIdsResolved = await arrIds;
  //console.log(orderItemsIdsResolved,"return ids")

  const totalPrices = await Promise.all(orderItemsIdsResolved.map( async(orderItemId)=>{
    const orderItem = await OrderItem.findById(orderItemId).populate('product','price')
    const totalPrice = orderItem.product.price * orderItem.quantity
    return totalPrice
  }))
  console.log(totalPrices)
  const totalPrice = totalPrices.reduce((a, b)=> a+b, 0 )
  const orders = new ordersSchema({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    phone: req.body.phone,
    country: req.body.country,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  const order = await orders.save();
  if (!order) {
    return res
      .status(400)
      .json({ success: false, message: "couldnt create new order" });
  }
  res.status(201).json({
    success: true,
    message: "your order has been placed",
    order: order,
  });
};

exports.updateOrder = async (req, res) => {
  const order = await ordersSchema.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  await order
    .save()
    .then((order) => {
      res.status(201).json({ success: true, message: "order updated " });
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: "failed" });
    });
};

exports.deleteOrder = async (req,res)=> {
  ordersSchema
    .findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order){
        await order.orderItems.map(async orderItem=>{
          await OrderItem.findByIdAndRemove(orderItem)
        })
        res.status(200).send({success:true, message:"order and order-items deleted"})}
      else{
        res.status(400).send({success:false, message:"order couldnt deleted"})
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, message: err });
    });
};

exports.countOrder = async (req, res) => {
  const countOrder = await ordersSchema.countDocuments((count) => count);
  if (!countOrder) {
    res.status(500).json({ success: false });
  }
  res.status(200).json({
    countOrder: countOrder,
  });
};

exports.getTotalsales = async (req,res)=>{
  const totalsales = await ordersSchema.aggregate([
    {$group: {_id:null, totalsales: {$sum: '$totalPrice'}}}
  ])

  if(!totalsales){
    res.status(400).send({message:"the order sales couldnt be generated"})
  }
  res.send({totalsales: totalsales})
}
