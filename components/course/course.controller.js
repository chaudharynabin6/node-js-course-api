const { getFormatedCourseDetail, generateJSON } = require("./course.query");
const express = require("express");
const path = require("path");
const fs = require("fs");

function generateCourseDetail(req, res, next) {
  let dir = req.query.dir;
  generateJSON(dir)
    .then((course) => {
      res.setHeader("Content-Type", "application/json");
      res.json(course);
    })
    .catch((err) =>
      next({
        status: 500,
        msg: err,
      })
    );
}

function getCourseDetail(req, res, next) {
  let dir = req.query.dir;

  getFormatedCourseDetail(dir)
    .then((coursesDetail) => {
      console.log(coursesDetail);
      res.setHeader("Content-Type", "application/json");
      res.json(JSON.stringify(coursesDetail));
    })
    .catch((err) => {
      next({
        status: "500",
        msg: err,
      });
    });
}

function getFile(req, res, next) {
  let dir = req.query.dir;
  let mimeType = req.query["mime-type"];
  let { component, filename } = req.params;

  let location = path.resolve(dir, "src/components", component, filename);

  const stat = fs.statSync(location);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(location, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    if (!mimeType.includes("video")) {
      head["Content-Type"] = "text/plain";
      head["char-set"] = "UTF-8";
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    if (!mimeType.includes("video")) {
      head["Content-Type"] = "text/plain";
      head["char-set"] = "UTF-8";
    }
    res.writeHead(200, head);
    fs.createReadStream(location).pipe(res);
  }

  let info = {
    dir,
    component,
    filename,
    location,
    range,
  };

  console.table(info);

  // res.sendFile(location, (err) => {
  //   next({
  //     status: 500,
  //     msg: err,
  //   });
  // });
}
module.exports = {
  generateCourseDetail,
  getCourseDetail,
  getFile,
};
