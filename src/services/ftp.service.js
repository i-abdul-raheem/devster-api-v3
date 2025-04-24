const ftp = require("basic-ftp");
const { Readable } = require("stream");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

async function connectFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  await client.access({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    secure: false,
  });
  await client.cd("../uploads");
  return client;
}

exports.uploadToFTP = async (buffer, originalName) => {
  const client = await connectFTP();
  try {
    const ext = path.extname(originalName);
    const uniqueName = uuidv4() + ext;
    const stream = Readable.from(buffer);
    await client.uploadFrom(stream, uniqueName);
    return `${process.env.FTP_PUBLIC_URL}/${uniqueName}`;
  } finally {
    client.close();
  }
};

exports.listFilesFTP = async () => {
  const client = await connectFTP();
  try {
    const list = await client.list();
    return list
      .filter((f) => f.name !== "." && f.name !== "..")
      .map((file) => ({
        name: file.name,
        size: file.size,
        modifiedAt: file.modifiedAt,
        url: `${process.env.FTP_PUBLIC_URL}/${file.name}`,
      }));
  } finally {
    client.close();
  }
};

exports.deleteFileFTP = async (name) => {
  const client = await connectFTP();
  try {
    await client.remove(name);
  } finally {
    client.close();
  }
};

exports.renameFileFTP = async (oldName, newName) => {
  const client = await connectFTP();
  try {
    await client.rename(oldName, newName);
  } finally {
    client.close();
  }
};
