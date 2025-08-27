const express = require("express");
const router = express.Router();

const { LucidPulling } = require("../v1/lucidSupply/index");

router.route("/lucid-pulling").post(LucidPulling);

module.exports = router;
