const path = require("path");
const Employee = require("../models/Employee.model");
const { uploadToFTP, deleteFileFTP } = require("../services/ftp.service");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeID: req.params.id });
    if (!employee) return res.status(404).json({ error: "Not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    let photoUrl = "";

    if (!req.files || !req.files.photo) {
      return res.status(400).json({ error: "Picture is required" });
    }

    // Validate & upload photo
    const file = req.files.photo;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type for photo" });
    }
    photoUrl = await uploadToFTP(file.data, file.name);

    // Parse comma-separated links into array
    let linksArray = [];
    if (req.body.links) {
      linksArray = req.body.links
        .split(",")
        .map((link) => link.trim())
        .filter((link) => link !== "");
    }

    const newEmp = new Employee({
      ...req.body,
      links: linksArray,
      photo: photoUrl,
    });

    const saved = await newEmp.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create Employee Error:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // this is employeeID now

    // Find existing employee by employeeID
    const employee = await Employee.findOne({ employeeID: id });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    let newPhotoUrl = employee.photo;

    // Handle photo upload if provided
    if (req.files && req.files.photo) {
      const file = req.files.photo;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid photo format" });
      }

      newPhotoUrl = await uploadToFTP(file.data, file.name);

      // Delete old photo if it's a public FTP URL
      if (
        employee.photo &&
        employee.photo.includes(process.env.FTP_PUBLIC_URL)
      ) {
        const oldFileName = path.basename(employee.photo);
        await deleteFileFTP(oldFileName);
      }
    }

    // Handle links (parse if string)
    let linksArray = employee.links;
    if (req.body.links) {
      linksArray =
        typeof req.body.links === "string"
          ? req.body.links
              .split(",")
              .map((link) => link.trim())
              .filter(Boolean)
          : req.body.links;
    }

    const updated = await Employee.findOneAndUpdate(
      { employeeID: id },
      {
        ...req.body,
        photo: newPhotoUrl,
        links: linksArray,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findOneAndDelete({
      employeeID: req.params.id,
    });
    if (!deleted) return res.status(404).json({ error: "Employee not found" });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
};
