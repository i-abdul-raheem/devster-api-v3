const express = require("express");
const router = express.Router();
const controller = require("../controllers/files.controller.js");

router.get("/", controller.listFiles);
router.get("/:name", controller.getFileUrl);
router.post("/", controller.uploadFile);
router.delete("/:name", controller.deleteFile);
router.patch("/:name/rename", controller.renameFile);

module.exports = router;
