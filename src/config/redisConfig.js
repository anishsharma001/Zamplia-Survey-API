const { merge: _merge } = require("lodash");

let defaultConfig = {};
let currentEnvConfig = {};

try {
  defaultConfig = require("./default.json");
} catch (e) {
  console.error("config/default.json is not found, or is invalid");
}

try {
  if (process.env.NODE_ENV) {
    // eslint-disable-next-line import/no-dynamic-require
    currentEnvConfig = require(`./${process.env.NODE_ENV}.json`);
  }
} catch (e) {
  console.error(`config/${process.env.NODE_ENV}.json is not found, or is invalid`);
}

module.exports = _merge(defaultConfig, currentEnvConfig);
