const express = require("express");
require("dotenv").config();
let queryWrapperMysql = require("./database/queryWrapperMysql");
const allRoutes = require("./routes/routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares

app.use(express.json()); // parse JSON body

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/", function (req, res) {
  res.send("Wecome to Zamplia Survey Api");
});

// Routes
app.use("/api", allRoutes);

process
  .on("unhandledRejection", (reason, p) => {
    let tableName = process.env.NODE_ENV == "production" ? `sqlerrorlogging` : `sqlerrorlogging_staging`;
    let queryToInsert = `INSERT INTO ${tableName} (query, data, error) VALUES ?`;
    let errorData = reason;
    if (reason.stack) {
      errorData = reason.stack;
    }
    queryWrapperMysql.executedev(queryToInsert, [[["CodeError", "unhandledRejection", errorData]]], function (responseData) {
      console.error(reason, "Unhandled Rejection at Promise", p);
    });
  })
  .on("uncaughtException", (err) => {
    let tableName = process.env.NODE_ENV == "production" ? `sqlerrorlogging` : `sqlerrorlogging_staging`;
    let queryToInsert = `INSERT INTO ${tableName} (query, data, error) VALUES ?`;

    let errorData = err;
    if (err.stack) {
      errorData = err.stack;
    }

    queryWrapperMysql.executedev(queryToInsert, [[["CodeError", "uncaughtException", errorData]]], function (responseData) {
      console.error(err, "Uncaught Exception thrown");
    });
  });

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
