const express = require("express");
const auth = require("./authApi");
const user = require("./userApi");
const customer = require("./customerApi");
const category = require("./categoryApi");
const order = require("./orderApi");
const payment = require("./paymentApi");
const invoice = require("./invoiceApi");
const item = require("./itemApi");
const promotion = require("./promotionApi");
const table = require("./tableApi");
const orderDetail = require("./orderDetailApi");
const comboItem = require("./comboItemApi");
const combo = require("./comboApi");
const role = require("./roleApi");
const customerPromotion = require("./customerPromotionApi");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/customers", customer);
router.use("/categories", category);
router.use("/orders", order);
router.use("/payments", payment);
router.use("/invoices", invoice);
router.use("/items", item);
router.use("/promotions", promotion);
router.use("/tables", table);
router.use("/combos", combo);
router.use("/combo-items", comboItem);
router.use("/order-details", orderDetail);
router.use("/roles", role);
router.use("/customer-promotions", customerPromotion);
router.use("/analytics", require("./analyticsApi"));

module.exports = router;
