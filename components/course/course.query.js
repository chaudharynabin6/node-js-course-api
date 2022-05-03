const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");
const mime = require("mime-types");

Promise.promisifyAll(fs);
Promise.promisifyAll(path);

// const directory = "./src/components";

function listDir(/* directory */ directory) {
  return new Promise((resolve, rejects) => {
    let fileList = [];
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.log("list dir error:" + err);
        rejects(err);
      } else {
        files.forEach((file) => {
          if (fs.lstatSync(path.resolve(directory, file)).isDirectory()) {
            fileList.push({ type: "directory", name: file });
          } else {
            fileList.push({ type: "file", name: file });
          }
        });
      }
      resolve(fileList);
    });
  });
  null;
}

async function generateJSON(directory) {
  // list components
  directory = directory + "/src/components";
  let components = await listDir(directory).filter(
    (item) => item.type == "directory"
  );

  // list component details
  let componentFiles = await Promise.map(components, async (c, index) => {
    console.log(c);
    let { type, name } = c;

    let files = await listDir(path.resolve(directory, name));

    // list component details
    let fileDetail = await Promise.map(
      files,
      async ({ type, name: fileName }) => {
        let filePath = path.resolve(directory, name + fileName);
        return {
          fileName: fileName,
          mime: mime.lookup(filePath),
        };
      }
    );

    return {
      courseNumber: index,
      name: name,
      files: fileDetail,
    };
  });

  function jsonStringify(any) {
    return new Promise((resolve, reject) => {
      let data = JSON.stringify(any);
      resolve(data);
    });
  }
  //write
  let courseData = await jsonStringify(componentFiles);
  fs.writeFile(
    path.resolve(directory, "courses.json"),
    courseData,
    { flag: "w" },
    () => console.log("courses.json written")
  );

  return courseData;
}

function getCourseDetail(directory) {
  directory = path.resolve(directory + "/src/components/" + "courses.json");
  console.log(directory);

  return new Promise((resolve, reject) => {
    try {
      fs.readFile(directory, (error, data) => {
        let coursesDetail = JSON.parse(data.toString("utf-8"));
        resolve(coursesDetail);
        console.log(coursesDetail);
      });
    } catch (err) {
      reject(err);
    }
  });
}

//component accept
// id , coursename , videos , js , markdown

let courses = [
  {
    courseNumber: 1,
    name: "code-editor",
    files: [
      { fileName: "CodeEditor.js", mime: "application/javascript" },
      { fileName: "code-editor.scss", mime: "text/x-scss" },
    ],
  },
  {
    courseNumber: 2,
    name: "copy-to-clipboard",
    files: [
      { fileName: "CopyToClipboard.js", mime: "application/javascript" },
      { fileName: "copy-to-clipboard.scss", mime: "text/x-scss" },
    ],
  },
  {
    courseNumber: 3,
    name: "course-title",
    files: [
      { fileName: "CourseTitle.js", mime: "application/javascript" },
      { fileName: "course-title.scss", mime: "text/x-scss" },
    ],
  },
  {
    courseNumber: 4,
    name: "header",
    files: [
      { fileName: "Header.js", mime: "application/javascript" },
      { fileName: "header.scss", mime: "text/x-scss" },
    ],
  },
  {
    courseNumber: 5,
    name: "slidebar",
    files: [
      { fileName: "Slider.js", mime: "application/javascript" },
      { fileName: "slider.scss", mime: "text/x-scss" },
    ],
  },
  {
    courseNumber: 6,
    name: "syntax-highlighter",
    files: [
      { fileName: "SyntaxHighlighter.js", mime: "application/javascript" },
      { fileName: "syntax-highlighter.scss", mime: "text/x-scss" },
    ],
  },
  {
    courseNumber: 7,
    name: "video-component",
    files: [{ fileName: "VideoComponent.js", mime: "application/javascript" }],
  },
];

// {
//     courseNumber: 6,
//     name: "syntax-highlighter",
//     files: [
//       { fileName: "SyntaxHighlighter.js", mime: "application/javascript" },
//       { fileName: "syntax-highlighter.scss", mime: "text/x-scss" },
//     ],
//   }

// let obj = {
//   courseNumber: 6,
//   name: "sytax-highlighter",
//   videos: ["001.mp4", "002.mp4"],
//   javaScript: ["syntaxHighlighter.js"],
//   scss: ["syntax-highlighter.scss"],
// };

function getFormatedCourseDetail(directory) {
  return getCourseDetail(directory).then((data) => {
    return data.reduce((previous, current) => {
      if (!current) return previous;
      let { courseNumber, name, files } = current;

      let videos, javaScript, scss, markdown;
      videos = [];
      javaScript = [];
      scss = [];
      markdown = [];
      for (const { fileName, mime } of files) {
        switch (mime) {
          case "application/javascript":
            javaScript.push(fileName);
            break;

          case "text/x-scss":
            scss.push(fileName);
            break;

          case "video/x-matroska":
          case "video/mp4":
            videos.push(fileName);
            break;

          case "text/markdown":
          case "text/plain":
          case "text/*":
            markdown.push(fileName);
            break;

          default:
            break;
        }

        previous.push({
          courseNumber,
          name,
          videos,
          javaScript,
          scss,
          markdown,
        });

        return previous;
      }
    }, []);
  });
}

module.exports = {
  getFormatedCourseDetail,
  generateJSON,
};
