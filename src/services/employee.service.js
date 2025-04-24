const Employee = require("../models/Employee.model");

exports.getEmployeeByEmail = async (email) => {
  const emp = await Employee.findOne({ email });
  if (!emp) {
    throw new Error("Employee not found for email: " + email);
  }

  return {
    employeeID: emp.employeeID,
    employeeCNIC: emp.employeeCNIC,
    employeeName: emp.employeeName,
    employeeDesignation: emp.employeeDesignation,
    slackUserId: emp.slackUserId,
    email: emp.email,
    photo: emp.photo,
    links: emp.links,
  };
};
