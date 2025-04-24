const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const app = express();
const port = process.env.PORT || 3000;

const salarySlipsAPI = require("./api/salarySlips");
const filesRoute = require("./api/files");
const db = require("./config/db");

app.use(cors());
app.use(fileUpload());
app.use("/api/files", filesRoute);
app.use("/api/salary-slips", salarySlipsAPI);

app.get("/", (req, res) => {
  res.send("Welcome to the Devster API V3!");
});
app.get("/salary-slips", (req, res) => {
  res
    .status(200)
    .sendFile(path.join(__dirname, "./views/salary.html"), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status).end();
      }
    });
});

if (process.env.NODE_ENV === "local") {
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

module.exports = app;
