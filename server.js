const express = require('express');
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv/config')
const authJwt = require('./helpers/jwt')
const cors = require('cors')
const errorHandler = require('./helpers/error-handler')

app.use(cors())
app.use('*',cors())

//middleware
app.use(morgan('tiny'))
app.use(express.json())
app.use(authJwt())
app.use(errorHandler)

// Database connection
mongoose.connect(process.env.DB_URL,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useUnifiedTopology:true,
  useFindAndModify:false
}).then(()=>{
  console.log("database connection success")
})
.catch(()=>{
  console.log("database connection failed")
})

const categoryRoutes = require("./routes/category")
app.use("/api/v1", categoryRoutes)

const productRoutes = require("./routes/product")
app.use("/api/v1", productRoutes)

const userRoutes = require("./routes/user");
const jwtAuth = require('./helpers/jwt');
app.use("/api/v1", userRoutes)

const orderRouter  = require('./routes/orders')
app.use("/api/v1", orderRouter)

app.listen(process.env.PORT, () => {
  console.log(`the server is running at port no. ${process.env.PORT}`)
});
