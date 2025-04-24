function decodeServiceAccount() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!encoded)
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_BASE64 in .env");

  const json = Buffer.from(encoded, "base64").toString("utf-8");
  return JSON.parse(json); // 👈 return object directly
}

module.exports = { decodeServiceAccount };
