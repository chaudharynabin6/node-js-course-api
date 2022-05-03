const express = require("express");
const router = express.Router();
const courseController = require("./course.controller");

/* GET users listing. */
router
  .route("/course-detail/")
  .get(courseController.getCourseDetail)
  .post(courseController.generateCourseDetail);

router.route("/:component/:filename").get(courseController.getFile);

module.exports = router;
