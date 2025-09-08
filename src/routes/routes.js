const express = require("express");
const router = express.Router();

const { LucidPulling } = require("../v1/lucidSupply/index");
const { sagoPulling } = require("../v1/sagoPulling/index");
const { insertUnimrktSurveysInDb } = require("../v1/unimrktPulling/index");
const {IpsosPulling}  = require("../v1/IpsosSupply/index");
const {BioBrainPulling } = require("../v1/BioBrainPulling/index");
const { symmetricSamplingIntergration} = require("../v1/symmetricSamplingIntergration/index");
const { archivingStudies } = require("../v1/archiving/studies");

router.route("/lucid-pulling").post(LucidPulling);
router.route("/sago-pulling").get(sagoPulling);
router.route("/unimrkt-pulling").post(insertUnimrktSurveysInDb);
router.route("/ipsos-pulling").post(IpsosPulling);
router.route("/biobrain-pulling").post(BioBrainPulling);
router.route("/symmtric-pulling").post(symmetricSamplingIntergration);
router.route("/archiving-studies").get(archivingStudies);


module.exports = router;
