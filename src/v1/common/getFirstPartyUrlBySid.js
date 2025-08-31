async function getFirstPartyUrlBySid(SID){
    var data = {};
    return new Promise(function(resolve, reject) {
        let query ="SELECT firstPartyUrl FROM studies WHERE 	_id = '" + SID + "'";
        queryWrapper.execute(query, [], function (result) {
                data.firstPartyUrl = result[0];
                resolve(data);
            });
    });
}


module.exports= {
    getFirstPartyUrlBySid : getFirstPartyUrlBySid
}