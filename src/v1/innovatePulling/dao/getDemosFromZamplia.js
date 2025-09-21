const redis = require('../../../middlewares/redisClient');

async function getZampliaDemos(lang_code) {
   let query = `select d._id as demographicId, dq._id as demoqueryId, d.name, d.innovateMrName, qo._id as queryoptionId, dq.innovateQid, qo.innovateOid
   from queryoptions as qo 
   join demoquery as dq on dq._id = qo.queryId and dq.lang_code = "${lang_code}"
   join demographics as d on d._id = dq.demographicId
   where qo.innovateOid is not null AND qo.lang_code = "${lang_code}";`;

   const cacheKeys = {
      key: 'zapliaDemosForInnovatemrzamplia',
      expiry: "-1",
   };

   var id = `zapliaDemosForInnovatemrzamplia${lang_code}`;
   return new Promise(function (resolve, reject) {
      redis.getData(cacheKeys, query, [], { id }).then(function (responseData) {
         if (responseData.errno && responseData.errno !== undefined) {
            resolve([]);
         } else {
            let res = {
               option : responseData
            }
            resolve(res);
         }
      }).catch(function (error) {
         resolve([]);
      });
   });
}

module.exports = {
   getZampliaDemos
}