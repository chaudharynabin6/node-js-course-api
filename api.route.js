const router = require("express").Router();

const courseRoute = require("./components/course/course.route");

router.use("/course", courseRoute);

module.exports = router;
