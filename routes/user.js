const express = require("express")
const { getSingle } = require("../controller/product")
const { getAllUser, addUser, getSingleUser, userLogin, userRegister, countUser, deleteUser, confirmationPost, resendTokenPost } = require("../controller/user")

const router = express.Router()

router.get("/user", getAllUser)
router.post("/user/register",userRegister)
router.get('/user/:id', getSingleUser)
router.post('/user/login', userLogin)
router.get('/user/get/count', countUser)
router.delete('/user/:id', deleteUser)
router.get('/user/token/confirmation/:token', confirmationPost)
router.post('/user/token/resend', resendTokenPost)

module.exports = router