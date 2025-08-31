const express = require("express");
const router = express.Router();

const { LucidPulling } = require("../v1/lucidSupply/index");
const { sagoPulling } = require("../v1/sagoPulling/index");
const { insertUnimrktSurveysInDb } = require("../v1/unimrktPulling/index");


router.route("/lucid-pulling").post(LucidPulling);
router.route("/sago-pulling").get(sagoPulling);
router.route("/unimrkt-pulling").post(insertUnimrktSurveysInDb);

module.exports = router;
