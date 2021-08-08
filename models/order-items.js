const mongoose = require("mongoose");
const orderItemsSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    default: 1,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

orderItemsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orderItemsSchema.set("toJSON", {
  virtuals: true,
});

const OrderItems = mongoose.model("OrderItem", orderItemsSchema);
module.exports = OrderItems;
