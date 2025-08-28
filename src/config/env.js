const { config } = require("dotenv");
const { cleanEnv, str, num } = require("envalid");
const path = require("path");
console.log(process.env.NODE_ENV);

config({
  path: path.resolve(__dirname, "../../", `.env.production.local`),
});

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["test", "development", "production", "staging", "newfeature"] }),
  MYSQL_HOST: str(),
  MYSQL_PORT: num({ default: 3306 }),
  MYSQL_USERNAME: str(),
  MYSQL_PASSWORD: str(),
  MYSQL_DATABASE: str(),

  MYSQL_HOST_STAGING: str(),
  MYSQL_USERNAME_STAGING: str(),
  MYSQL_PASSWORD_STAGING: str(),
  MYSQL_DATABASE_STAGING: str(),

  MYSQL_HOST_DEV: str(),
  MYSQL_USERNAME_DEV: str(),
  MYSQL_PASSWORD_DEV: str(),
  MYSQL_DATABASE_DEV: str(),

  MYSQL_HOST_REPLICATION: str(),
  MYSQL_USERNAME_REPLICATION: str(),
  MYSQL_PASSWORD_REPLICATION: str(),
  MYSQL_DATABASE_REPLICATION: str(),

  MYSQL_HOST_ARCHIEVE: str(),
  MYSQL_USERNAME_ARCHIEVE: str(),
  MYSQL_PASSWORD_ARCHIEVE: str(),
  MYSQL_DATABASE_ARCHIEVE: str(),

  REDIS_PORT_STAGING: num({ default: 6380 }),
  REDIS_HOST_STAGING: str(),
  REDIS_PASSWORD_STAGING: str(),

  REDIS_PORT: num({ default: 6380 }),
  REDIS_HOST: str(),
  REDIS_PASSWORD: str(),
});

module.exports = {
  env,
};
