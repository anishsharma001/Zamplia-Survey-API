
const fs = require('fs');
const tls = require('tls');
const asyncRedis = require('async-redis');
const config = require('../config/redisConfig');
const queryWrapper  = require('../database/queryWrapperMysql')
const log4js = require('../config/logger');
const logger = log4js.getLogger('RedisClient');

const {
	map: _map,
	keys: _keys,
	values: _values,
	omit: _omit,
	isNil: _isNil
} = require('lodash');

const redisClient = getRedisClient();

function getRedisClient() {
	
	let cacheConnection = '';
	// const redisClient =  asyncRedis.createClient(config.api.redis.client);
	if(process.env.NODE_ENV === 'local'){
		cacheConnection =  asyncRedis.createClient(config.api.redis_local);
	}else{
		cacheConnection = asyncRedis.createClient(config.api.redis.port, config.api.redis.client, {
			auth_pass: config.api.redis.authPass,
			tls: { servername: config.api.redis.client }
		});
	}

	cacheConnection.on('error', err => {
		//TODO: use file logger
		logger.error(`Error ${err}`);
		throw err;
	});

	return cacheConnection;
}

/*
Name:getDynamicKey
Desc: This funciton return a dynamic cache Key based on parameters*/
function getDynamicKey(key, obj) {
	let dynamicKey = '';
	_map(_keys(obj), data => {
		// create a string using object "key_value"
		dynamicKey += (dynamicKey === '') ? `${data}_${obj[data]}` : `__${data}_${obj[data]}`;
	});
	logger.debug(`generation dynamic key from reddis ${key}`);
	return `${key}~${dynamicKey}`;
}

/*
 *Name:getData
 *desc: This function fetch data from redis server.
 *return: JSON object
 */
async function get(key) {
	try {
		logger.debug(`Getting key ${key} from reddis`);
		// get data from redis
		const cachedData = await redisClient.get(key);
		// parse data and return
		return cachedData !== null ? JSON.parse(cachedData) : null;
	} catch (error) {
		logger.error(`Getting error while reading key from reddis ${error}`);
		throw error;
	}
}

/*
 *Name: expire
 *desc: This function expires data from redis server
 *return: Object
 */
async function expire(key, expiry) {
	try {
		// set  expiry time for data in redis
		logger.debug(`expiring key ${key} from reddis`);
		return await redisClient.expire(key, expiry);
	} catch (error) {
		logger.error(`Getting error while key expiration  reddis ${error}`);
		throw error;
	}
}

/*
 *Name:setData
 *desc: this function save data into redis server.
 *return: object
 */
async function set(key, value) {
	try {
		logger.debug(`setting key ${key} in reddis`);
		// set data into redis
		return await redisClient.set(key, [JSON.stringify(value)]);
	} catch (error) {
		logger.error(`Error while setting  keys from reddis ${error}`);
		throw error;
	}
}

/*
 *Name:removeOne
 *desc: this function remove data from redis server.
 *return: object
 */
async function removeOne(key) {
	try {
		// remove data from redos server.
		logger.debug(`removing key from reddis`);
		const response = await redisClient.del(key);
		return response;
	} catch (error) {
		logger.error(`Error while removing key ${error}`);
		throw error;
	}
}

/*
 *Name: getData
 *Desc: this function help to get data from redis server, if redis server has no data coresponding to param.key 
 * then get data from database and save into redis server with expiry as per param.expiry.
 *return: object
 */
function getData(cacheKey, query, queryParam = null, cacheKeyParam = null) {
	return new Promise(async (resolve, reject) => {
		try {
			// get key name which will use in redis key
			const { expiry } = cacheKey;
			let { key } = cacheKey;

			// key comming with data filter then make a new key.
			if (cacheKeyParam != null) {
				key = getDynamicKey(key, cacheKeyParam);
			}

			// get data from redis for the key
			const redisResponse = await get(key);

			// if data is not avilable in redis then hget data from database and cache the data in redis seever.				
			if (redisResponse === null || redisResponse.length === 0) {
				const tempValues = _values(queryParam);

				try {
					const result = await queryWrapper.execute(query, tempValues);

					// remove unwanted properties
					const dbResponse = _map(result, dbValue =>
						_omit(dbValue, ['updatedAt', 'deletedAt'])
					);

					logger.info("**************** Response from DB ****************");

					// set data in redis server
					await set(key, dbResponse);

					// set expiry timer in redis server key's
					if (expiry === -1 || expiry === '-1') {
						logger.info(`No expiry key`);
					} else {
						await redisClient.expire(key, expiry);
					}

					resolve(dbResponse); // or resolve(dbResponse) if inside a Promise

				} catch (err) {
					logger.error(`ERROR : ${err.sqlMessage || err.message}`);
					return err; // or reject(err) if inside a Promise
				}

			}
			else {
				logger.info("****************Response  from Cache********************");
				resolve(redisResponse);
			}
		} catch (error) {
			//TODO: Log error
			logger.error(`Redis error ${error}`);
			reject(error);
		}
	});
}

async function deleteAllDataFromRedis() {
	try {
		logger.debug(`delete all keys from reddis `);
		return await redisClient.flushdb();
	} catch (error) {
		logger.error(`Error while deleting all keys from reddis ${error}`);
		throw error;
	}
}
module.exports = {
	get,
	set,
	expire,
	getData,
	removeOne,
	deleteAllDataFromRedis,
};
