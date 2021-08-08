const userSchema = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/token");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { getMaxListeners } = require("../models/user");

exports.userRegister = async (req, res) => {
  const newUser = new userSchema({
    name: req.body.name,
    email: req.body.email,
    hashPassword: bcrypt.hashSync(req.body.password, 10),
    address: req.body.address,
    country: req.body.country,
    city: req.body.city,
    phone: req.body.phone,
    appartment: req.body.phone,
    isAdmin: req.body.isAdmin,
  });
  const user = await newUser
    .save()
    .then((user) => {
      console.log(user)
      //create a verification token for this user
      const token = new Token({
        _userId: user.id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      console.log(token);
      token.save((error) => {
        if (error) {
          return res.status(500).send({ msg: error.message });
        }
        //send the email
        var transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          secure: false,
          port: process.env.SMTP_PORT,
          auth: { user: process.env.USER, pass: process.env.PASS },
        });
        var mailoption = {
          from: process.env.USER,
          to: user.email,
          subject: "token confirmation testing",
          text:
            `hello ${user.name}\n\n` +
            "please verify you email by clicking on the link: \nhttp://" +
            req.headers.host +
            "/api/v1/user/token/confirmation/" +
            token.token +
            "\n",
        };
        transporter.sendMail(mailoption, (err) => {
          if (err) {
            //console.log(err, "nksjdkns");
            return res.status(500).send({ msg: err.message });
          }
          res
            .status(200)
            .send(" A verification token has been sent to your mail");
        });
      });
      // res.status(201).json({ success: true, message: "user created", user });
    })
    .catch((error) => {
      res.status(400).json({ success: false, message: "cant create user" });
    });
};

exports.getAllUser = async (req, res) => {
  const allUser = await userSchema.find().select("-hashPassword");
  if (!allUser) {
    return res
      .status(400)
      .json({ success: false, message: "couldnt get the user" });
  }
  res.status(200).send(allUser);
};

exports.getSingleUser = async (req, res) => {
  const User = await userSchema.findById(req.params.id).select("-hashPassword");
  if (!User) {
    return res
      .status(400)
      .json({ success: false, message: "couldnt get the user" });
  }
  res.status(200).send(User);
};

exports.updateUser = async (req, res) => {
  const verify = await userSchema.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      country: req.body.country,
      city: req.body.city,
      phone: req.body.phone,
      appartment: req.body.phone,
    },
    { isNew: true }
  );
  const updated = await verify.save();
  if (!verify) {
    return res.status(400).json({ success: false, message: "couldnt update" });
  }
  res.status(200).send(verify);
};

exports.userLogin = async (req, res) => {
  email = req.body.email;
  password = req.body.password;
  const user = await userSchema.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ message: "user doesnt exists" });
  }
  const verifyPassword = await bcrypt.compare(password, user.hashPassword);
  if (!verifyPassword) {
    return res.status(400).json({ message: "invalid username or password" });
  }
  // token verification in email
  // if(!user.isVerified){
  //   return res.status(401).send({type: 'not-verified', message:"your account has not been verified"})
  // }
  if (user && verifyPassword) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRET,
      { expiresIn: "1d" }
    );
    res
      .status(200)
      .json({ message: "user login success", email: user.email, token: token });
  }
};

exports.countUser = async (req, res) => {
  const users = await userSchema.countDocuments((count) => count);
  if (!users) {
    return res.status(400).json({
      success: false,
    });
  }
  res.status(200).json({
    users: users,
  });
};

exports.deleteUser = async (req, res) => {
  await userSchema
    .findByIdAndRemove(req.params.id)
    .then((user) => {
      res.status(200).json({ success: true, message: "user delete success" });
    })
    .catch((error) => {
      res
        .status(400)
        .json({ success: false, message: "couldt delete the user" });
    });
};

// token confirmation
exports.confirmationPost = async (req, res) => {
  const token = await Token.findOne({ token: req.params.token });
  if (!token) {
    return res.status(400).send({
      type: "not-verified",
      msg: "we are unable to find a valid token. Your token may have expired.",
    });
  }
  //if we found a token, find a matching user
  const user = await userSchema.findOne({
    _id: token._userId,
    email: req.body.email,
  });
  if (!user) {
    return res
      .status(400)
      .send({ msg: "we are unable to find a user for this token" });
    if (user.isVerified) {
      return res.status(400).send({
        type: "already-verified",
        msg: "This user is already verified.",
      });
    }
    // verify the user and save
    user.isVerified = true;
    user.save().then((error) => {
      if (error) {
        return res.status(500).send({ msg: error.message });
      }
      res
        .status(200)
        .send({ message: "The user has been verified, please login" });
    });
  }
};

exports.resendTokenPost = (req, res) => {
  userSchema.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      return res
        .status(500)
        .send({ msg: "we are unable to fine the user with that user." });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .send({ msg: "This user has been already verified" });
    }
    //create a verification token, save it and sand mail
    var token = new Token({
      _userId: user.id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    //save the token
    token.save();
    //send the email
    var transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      secure: false,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.USER, pass: process.env.PASS },
    });
    var mailoption = {
      from: process.env.USER,
      to: user.email,
      subject: "token confirmation testing",
      text:
        `hello ${user.name}\n\n` +
        "please verify you email by clicking on the link: \nhttp://" +
        req.headers.host +
        "/api/v1/user/token/confirmation/" +
        token.token +
        "\n",
    };
    transporter.sendMail(mailoption, (err) => {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }
      res
        .status(200)
        .send(" A verification token has been send to " + user.email + ".");
    });
  });
};
