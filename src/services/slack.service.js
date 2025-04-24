const { WebClient } = require("@slack/web-api");

const slackToken = process.env.SLACK_TOKEN; // Your bot token
const slack = new WebClient(slackToken);

async function sendSalarySlipSlack(
  slackUserId,
  pdfBuffer,
  pdfFilename,
  docUrl,
  dateTime
) {
  try {
    const date = new Date(Date.parse(dateTime.replace(" UTC", "")));

    const salaryMonth = date.toLocaleString("en-US", { month: "long" });
    const salaryYear = String(date.getFullYear());

    async function sendMsg(currSlackUserId) {
      // Step 1: Open a direct message channel with the user
      const im = await slack.conversations.open({
        users: currSlackUserId,
      });

      const dmChannelId = im.channel.id;

      // Step 2: Upload the receipt PDF
      await slack.files.uploadV2({
        channel_id: dmChannelId,
        filename: pdfFilename,
        title: "Payoneer Receipt",
        file: pdfBuffer,
      });

      // Step 3: Send the message with the Docs link
      await slack.chat.postMessage({
        channel: dmChannelId,
        text: `Salary for ${salaryMonth} ${salaryYear} has been credited.\n\nSalary Slip: ${docUrl}`,
      });
    }
    for (const userId of [slackUserId, process.env.SLACK_ADMIN_USER_ID]) {
      // Send the message to both the user and the admin
      await sendMsg(userId);
    }
  } catch (err) {
    console.error("❌ Slack error:", err);
  }
}

module.exports = { sendSlackNotification: sendSalarySlipSlack };
