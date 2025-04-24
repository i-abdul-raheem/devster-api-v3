const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const app = express();
const port = process.env.PORT || 3000;
const db = require("./config/db");

app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use("/api/files", require("./api/files"));
app.use("/api/salary-slips", require("./api/salarySlips"));
app.use("/api/employees", require("./api/employee"));

app.get("/", (req, res) => {
  res.send("Welcome to the Devster API V3!");
});
app.get("/employee-manager", (req, res) => {
  res
    .status(200)
    .sendFile(path.join(__dirname, "./views/employee-manager.html"), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status).end();
      }
    });
});
app.get("/files-manager", (req, res) => {
  res
    .status(200)
    .sendFile(path.join(__dirname, "./views/files-manager.html"), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status).end();
      }
    });
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
