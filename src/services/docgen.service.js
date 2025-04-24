const { google } = require("googleapis");
const { Readable } = require("stream");
const { decodeServiceAccount } = require("../config/googleAuth");

const credentials = decodeServiceAccount();

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
  ],
});

const TEMPLATE_ID = process.env.SALARY_DOCX_TEMPLATE_ID;

async function generateSalarySlip(data) {
  const client = await auth.getClient();
  const docs = google.docs({ version: "v1", auth: client });
  const drive = google.drive({ version: "v3", auth: client });

  // Step 1: Copy the template
  const copied = await drive.files.copy({
    fileId: TEMPLATE_ID,
    requestBody: {
      name: `Salary Slip - ${data.employeeName} - ${data.salaryMonth} ${data.salaryYear}`,
    },
  });

  const docId = copied.data.id;

  // Step 2: Replace placeholders
  const requests = Object.entries(data).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: `{{${key}}}`,
        matchCase: true,
      },
      replaceText: value,
    },
  }));

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: { requests },
  });

  // Step 3: Export Google Doc as PDF
  const pdfRes = await drive.files.export(
    { fileId: docId, mimeType: "application/pdf" },
    { responseType: "stream" }
  );

  const chunks = [];
  await new Promise((resolve, reject) => {
    pdfRes.data
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", resolve)
      .on("error", reject);
  });

  const pdfBuffer = Buffer.concat(chunks);

  // Step 4: Upload PDF to Drive
  const uploaded = await drive.files.create({
    requestBody: {
      name: `Salary Slip - ${data.employeeName} - ${data.salaryMonth} ${data.salaryYear}.pdf`,
      mimeType: "application/pdf",
      parents: [process.env.PDF_PARENT_FOLDER_ID],
    },
    media: {
      mimeType: "application/pdf",
      body: Readable.from(pdfBuffer),
    },
  });

  const pdfId = uploaded.data.id;

  // Step 5: Make PDF public
  await drive.permissions.create({
    fileId: pdfId,
    requestBody: {
      type: "anyone",
      role: "reader",
    },
  });

  // Step 6: Delete original Google Doc
  await drive.files.delete({ fileId: docId });

  // Step 7: Return PDF link
  return `https://drive.google.com/file/d/${pdfId}/view`;
}

module.exports = { generateSalarySlip };
