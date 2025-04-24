const { employeeDetailsMap } = require("./employee.service");
const pdf = require("pdf-parse");

const transformForTemplate = (payoneerData) => {
  const email = payoneerData.email;
  const employeeData = employeeDetailsMap[email] || {};
  const [salary] = payoneerData.amountSent.split(" ");
  const currency = payoneerData.amountSent.split(" ")[1] || "";
  const date = new Date(Date.parse(payoneerData.dateTime.replace(" UTC", "")));

  const salaryMonth = date.toLocaleString("en-US", { month: "long" });
  const salaryYear = String(date.getFullYear());
  const issuanceDate = date.toISOString().split("T")[0];

  return {
    ...employeeData,
    salaryMonth,
    salaryYear,
    salary,
    currency,
    issuanceDate,
    email,
    dateTime: payoneerData.dateTime,
  };
};

const extractPayoneerDetails = async (buffer) => {
  const data = await pdf(buffer);
  const text = data.text.replace(/\s+/g, " ").trim();

  const details = {};
  const emailMatch = text.match(/Sent to([\w.-]+@[\w.-]+\.\w+)/i);
  if (emailMatch) details.email = emailMatch[1];

  const idMatch = text.match(/Transaction ID(\d+)/i);
  if (idMatch) details.transactionId = idMatch[1];

  const dateMatch = text.match(
    /Date\/Time(\d{1,2} \w+ \d{4} \d{2}:\d{2} UTC)/i
  );
  if (dateMatch) details.dateTime = dateMatch[1];

  const amountMatch = text.match(
    /Amount sent to recipient\s*([\d.,]+)\s*([A-Z]{3})/i
  );
  if (amountMatch) details.amountSent = `${amountMatch[1]} ${amountMatch[2]}`;

  const feeMatch = text.match(/Fee\s*([\d.,]+)\s*([A-Z]{3})/i);
  if (feeMatch) details.fee = `${feeMatch[1]} ${feeMatch[2]}`;

  const totalMatch = text.match(
    /Total amount charged\s*([\d.,]+)\s*([A-Z]{3})/i
  );
  if (totalMatch) details.totalCharged = `${totalMatch[1]} ${totalMatch[2]}`;

  const descMatch = text.match(
    /Transaction description(.+?)Foradditionalassistance/i
  );
  if (descMatch) details.description = descMatch[1].trim();

  return transformForTemplate(details);
};

module.exports = {
  parsePayoneerPDF: extractPayoneerDetails,
};
