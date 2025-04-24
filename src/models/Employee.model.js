const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    employeeID: { type: String, required: true, unique: true },
    employeeName: { type: String, required: true },
    employeeCNIC: { type: String, required: true, unique: true },
    employeeDesignation: { type: String, required: true },
    slackUserId: { type: String },
    photo: { type: String, default: "" },

    links: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
