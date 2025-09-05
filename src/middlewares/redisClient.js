const { createClient } = require('redis');
const config = require('../config/redisConfig');
const queryWrapper = require('../database/queryWrapperMysql');
const log4js = require('../config/logger');
const logger = log4js.getLogger('RedisClient');

const { map: _map, keys: _keys, values: _values, omit: _omit } = require('lodash');

const redisClient = getRedisClient();

function getRedisClient() {
  const isLocal = process.env.NODE_ENV === 'local';
  const client = createClient({
    socket: {
      host: isLocal ? config.api.redis_local.host : config.api.redis.host,
      port: isLocal ? config.api.redis_local.port : config.api.redis.port,
      tls: isLocal ? undefined : true
    },
    password: isLocal ? undefined : config.api.redis.authPass
  });

  client.on('error', (err) => {
    logger.error(`Redis Client Error: ${err}`);
  });

  client.connect()
    .then(() => logger.info('Redis client connected successfully'))
    .catch((err) => logger.error('Redis connection failed:', err));

  return client;
}

/* Generate dynamic cache key */
function getDynamicKey(key, obj) {
  const dynamicKey = _map(_keys(obj), k => `${k}_${obj[k]}`).join('__');
  logger.debug(`Generated dynamic key for redis: ${key}`);
  return `${key}~${dynamicKey}`;
}

/* Get data from Redis */
async function get(key) {
  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    logger.error(`Error getting key ${key} from redis: ${error}`);
    throw error;
  }
}

/* Set data in Redis with optional TTL */
async function set(key, value, ttl = null) {
  try {
    if (ttl && ttl !== -1 && ttl !== '-1') {
      return await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    }
    return await redisClient.set(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`Error setting key ${key} in redis: ${error}`);
    throw error;
  }
}

/* Remove a key from Redis */
async function removeOne(key) {
  try {
    return await redisClient.del(key);
  } catch (error) {
    logger.error(`Error removing key ${key} from redis: ${error}`);
    throw error;
  }
}

/* Get data from cache or DB */
async function getData(cacheKey, query, queryParam = null, cacheKeyParam = null) {
  try {
    const { expiry } = cacheKey;
    let { key } = cacheKey;

    if (cacheKeyParam) {
      key = getDynamicKey(key, cacheKeyParam);
    }

    const cached = await get(key);
    if (cached && cached.length > 0) {
      logger.info("Response from Cache");
      return cached;
    }

    const tempValues = _values(queryParam);
    const result = await queryWrapper.execute(query, tempValues);

    const dbResponse = _map(result, r => _omit(r, ['updatedAt', 'deletedAt']));
    logger.info("Response from DB");

    await set(key, dbResponse, expiry);
    return dbResponse;

  } catch (error) {
    logger.error(`Redis getData error: ${error}`);
    throw error;
  }
}

/* Delete all keys from Redis */
async function deleteAllDataFromRedis() {
  try {
    return await redisClient.flushDb();
  } catch (error) {
    logger.error(`Error deleting all keys from redis: ${error}`);
    throw error;
  }
}

module.exports = {
  get,
  set,
  getData,
  removeOne,
  deleteAllDataFromRedis
};
