const { lucidLogsEnable, insertLucidLogging } = require("./model/lucidmodel");

async function lucidSupplyLogs(request, response, type, count = 0) {
  try {
    const checkLoggingEnable = await lucidLogsEnable("LucidSupplyLogsEnable");
    if (checkLoggingEnable.length > 0) {
      let date = new Date();
      let data = [];
      data.push([request, response, type, date, count]);
      await insertLucidLogging(data);
    }
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { lucidSupplyLogs };
