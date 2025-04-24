const express = require("express");
const router = express.Router();
const controller = require("../controllers/employee.controller");

router.get("/", controller.getAllEmployees);
router.get("/:id", controller.getEmployeeById);
router.post("/", controller.createEmployee);
router.patch("/:id", controller.updateEmployee);
router.delete("/:id", controller.deleteEmployee);

module.exports = router;
