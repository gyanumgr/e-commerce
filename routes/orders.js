const express = require('express')
const { getOrders, newOrders, getOrder, updateOrder, deleteOrder, countOrder, getTotalsales } = require('../controller/orders')
const router = express.Router()

router.post('/orderPost', newOrders)
router.get('/orders', getOrders)
router.get('/orders/:id', getOrder)
router.patch('/orders/:id', updateOrder )
router.delete('/orders/:id', deleteOrder)
router.get('/order/count', countOrder)
router.get('/orders/total/sales', getTotalsales)


module.exports = router