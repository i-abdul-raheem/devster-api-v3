const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const app = express();
const port = process.env.PORT || 3000;

const salarySlipsAPI = require("./api/salarySlips");

app.use(fileUpload());
app.use("/api/salary-slips", salarySlipsAPI);

if (process.env.NODE_ENV === "local") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
