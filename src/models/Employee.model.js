const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  employeeID: { type: String, required: true, unique: true },
  employeeName: String,
  employeeCNIC: String,
  employeeDesignation: String,
  slackUserId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
