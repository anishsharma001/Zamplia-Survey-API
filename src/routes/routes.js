const express = require("express");
const router = express.Router();

const {LucidPulling} = require('../lucidSupply/index');

router.post("/api/lucid-pulling", async (req, res) => {
    try {
        const result = await LucidPulling(req.body);
        res.json(result);
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




module.exports =  router;