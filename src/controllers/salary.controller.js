const pLimit = require("p-limit");
const limit = pLimit(5);

const { parsePayoneerPDF } = require("../services/payoneer.service");
const { generateSalarySlip } = require("../services/docgen.service");
const { sendSlackNotification } = require("../services/slack.service");
const { getEmployeeByEmail } = require("../services/employee.service");

exports.handleSalaryUpload = async (req, res) => {
  try {
    if (!req.files?.files)
      return res.status(400).json({ error: "No files uploaded." });

    const uploadedFiles = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    const tasks = uploadedFiles.map((file) =>
      limit(async () => {
        try {
          const receipt = await parsePayoneerPDF(file.data);
          const employee = await getEmployeeByEmail(receipt.email);

          // Merge both
          const slipInput = {
            ...employee,
            ...receipt,
            salary: receipt.amountSent.split(" ")[0],
            currency: receipt.amountSent.split(" ")[1] || "",
            issuanceDate: new Date(
              Date.parse(receipt.dateTime.replace(" UTC", ""))
            )
              .toISOString()
              .split("T")[0],
            salaryMonth: new Date(
              Date.parse(receipt.dateTime.replace(" UTC", ""))
            ).toLocaleString("en-US", { month: "long" }),
            salaryYear: new Date(
              Date.parse(receipt.dateTime.replace(" UTC", ""))
            )
              .getFullYear()
              .toString(),
          };
          const pdfUrl = await generateSalarySlip(slipInput);
          await sendSlackNotification(
            employee.slackUserId,
            file.data,
            file.name,
            pdfUrl,
            receipt.dateTime
          );
          return { ...receipt, pdfUrl };
        } catch (err) {
          return { error: err.message };
        }
      })
    );

    const results = await Promise.all(tasks);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected server error." });
  }
};
