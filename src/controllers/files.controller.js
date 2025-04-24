const {
  uploadToFTP,
  listFilesFTP,
  deleteFileFTP,
  renameFileFTP,
} = require("../services/ftp.service");

exports.listFiles = async (req, res) => {
  try {
    const files = await listFilesFTP();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFileUrl = async (req, res) => {
  try {
    const name = req.params.name;
    const url = `${process.env.FTP_PUBLIC_URL}/${name}`;
    res.json({ name, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.files) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    const results = [];

    for (const file of uploadedFiles) {
      const url = await uploadToFTP(file.data, file.name);
      results.push({ name: file.name, url });
    }

    res.json({ success: true, files: results });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    await deleteFileFTP(req.params.name);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.renameFile = async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: "newName is required" });
    await renameFileFTP(req.params.name, newName);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
