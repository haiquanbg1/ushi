const express = require("express");
const auth = require("./authApi");
const user = require("./userApi");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", user);

module.exports = router;
