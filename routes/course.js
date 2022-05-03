var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/course-detail/", function (req, res, next) {
  res.send("course-detail");
});

module.exports = router;
