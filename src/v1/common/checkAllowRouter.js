async function checkAllowRouter(TID, PID){
    var isAvailable = [];
    var data = {};
    return new Promise(function(resolve, reject) {
        var query = "select s.allowRouter As study,(select v.allowRouter  \
            from vendors As v WHERE v.allowRouter = 1 AND v._id = '"+ TID +"' ) AS vendor \
            from studies As s \
            where  s._id = (SELECT sid FROM participants where _id = '"+ PID +"' LIMIT 1)";

            queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                data.result = false;
                isAvailable.push(data);
            } else {
                if(result.length > 0) {
                    data.result = true;
                    data.vendorData = result[0];
                    isAvailable.push(data);
                } else {
                    data.result = false;
                    isAvailable.push(data);
                } 
            }
            resolve(isAvailable);
            });
    });
}

module.exports= {
    checkAllowRouter : checkAllowRouter
}