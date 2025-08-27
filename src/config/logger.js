var os = require("os");
const log4js = require("log4js");
let logFname = "/home/log/mpapi.log";
var paltform = os.platform();
if (paltform === "darwin") {
  logFname = "/Users/bibul/node/log/mpapi.log";
}

log4js.configure({
  disableClustering: true,
  appenders: {
    console: {
      type: "console",
    },
    file: {
      type: "file",
      filename: logFname,
      maxLogSize: 10240000,
      backups: 5,
      compress: true,
    },
  },
  disableClustering: false,
  categories: {
    default: { appenders: ["console"], level: "info" },
  },
});

module.exports = log4js;
