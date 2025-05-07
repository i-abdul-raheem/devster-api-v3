const pdf = require("pdf-parse");
const { getEmployeeByEmail } = require("./employee.service");

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
  // Extract salaryMonth and salaryYear from description
  const dateMatches = details.description.match(
    /^([A-Za-z]+)\s+(\d{4}),\s*Salary/i
  );
  if (dateMatches) {
    details.salaryMonth = dateMatches[1];
    details.salaryYear = dateMatches[2];
  }

  // Fetch dynamic employee details from DB
  const employeeData = await getEmployeeByEmail(details.email);

  const [salary] = details.amountSent.split(" ");
  const currency = details.amountSent.split(" ")[1] || "";
  const date = new Date(Date.parse(details.dateTime.replace(" UTC", "")));
  // const salaryMonth = date.toLocaleString("en-US", { month: "long" });
  // const salaryYear = String(date.getFullYear());
  const issuanceDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return {
    ...employeeData,
    salaryMonth: details.salaryMonth,
    salaryYear: details.salaryYear,
    salary,
    currency,
    issuanceDate,
    email: details.email,
    dateTime: details.dateTime,
    description: details.description,
    transactionId: details.transactionId,
    fee: details.fee,
    totalCharged: details.totalCharged,
    amountSent: details.amountSent,
  };
};

module.exports = {
  parsePayoneerPDF: extractPayoneerDetails,
};
