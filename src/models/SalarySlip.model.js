const mongoose = require("mongoose");

const SalarySlipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  transactionId: String,
  dateTime: String,
  amountSent: String,
  currency: String,
  description: String,
  pdfUrl: String,
  receiptFilename: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SalarySlip", SalarySlipSchema);
