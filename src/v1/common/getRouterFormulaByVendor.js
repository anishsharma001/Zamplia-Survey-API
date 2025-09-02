/**
 * getRouterFormulaByVendor will return the router formulla if ratecard is enabled on vendor
 */
async function getRouterFormulaByVendor(vendorId){
    let resultData = [];

    return new Promise(function(resolve, reject) {
            // Do async job
            var query = "Select * from router_formula Where vid='"+vendorId+"'";
            queryWrapper.execute(query, [], function (result) {
                
                let maxLoi, minLoi;
                let myAllCPis = [];
                    for(let a = 0 ; a < result.length; a++){
                        myAllCPis.push(result[a].IR90);
                        myAllCPis.push(result[a].IR75);
                        myAllCPis.push(result[a].IR50);
                        myAllCPis.push(result[a].IR25);
                        myAllCPis.push(result[a].IR10);
                    }

                        let data = {};
                        data.maxCpi = Math.max.apply(null, myAllCPis) 
                        data.minCpi = Math.min.apply(null, myAllCPis) 

                        resultData.push(data);
                        resolve(resultData);
            });     
        });
}
module.exports= {
    getRouterFormulaByVendor : getRouterFormulaByVendor
}