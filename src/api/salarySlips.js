const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salary.controller");

router.post("/", salaryController.handleSalaryUpload);

module.exports = router;