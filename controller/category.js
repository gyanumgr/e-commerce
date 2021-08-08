const categorySchema = require("../models/category");

exports.addCategory = async (req, res) => {
  try {
    const category = new categorySchema({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    const newcategory = await category.save();

    if (!newcategory) return res.status(204).send("cannot create category");

    res.send(newcategory);
  } catch (error) {
    res.status(400).send("failed to create new category");
  }
};

exports.getCategory = async (req, res) => {
  try {
    const allCategories = await categorySchema.find();
    if (!allCategories)
      return res.status(400).send("coulnt find the categories");
    res.status(201).send(allCategories);
  } catch (error) {
    res.status(400).send("failed to load categories");
  }
};

exports.deleteCategory = (req, res) => {
  categorySchema
    .findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category)
        res
          .status(200)
          .json({ success: true, message: "caategory deleted success" });
      else res.status(400).json({ success: false, message: "couldnt deleted" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, message: err });
    });
};

exports.updateCategory = async (req, res) => {
  const category = await categorySchema.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  await category
    .save()
    .then((category) => {
      res.status(201).json({ success: true, message: "category updated " });
    })
    .catch((err) => {
      res.status(400).json({ success: false, message: "failed" });
    });
};
