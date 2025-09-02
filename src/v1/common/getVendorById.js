/* getVendorById Will return the result in true or false. 
*  If record found, then TRUE
*  If record not found, then FALSE
*/ 
async function getVendorById(vendorId){
    var isAvailable = [];
    var data = {};
    return new Promise(function(resolve, reject) {
            var query = "SELECT * from vendors WHERE _id='" + vendorId + "'";
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
    getVendorById : getVendorById
}