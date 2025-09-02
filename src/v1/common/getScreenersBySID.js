/* getScreenersBySID Will return the result in true or false. 
*  If record found, then TRUE
*  If record not found, then FALSE
*/ 
async function getScreenersBySID(SID,langCode, originParticipant){
    var data = {};
    return new Promise(function(resolve, reject) {
        let query ="select * from studydemomapping as s left join demoquery as query on query._id = s.queryId  left join projectscreenerorder as so on so.studyId = s.studyId where so.screener_id = s.demographicId AND so.lang_code = '"+langCode+"' AND s.studyId ='"+SID+"' AND s.lang_code ='"+langCode+"';\
        select s.*,  query.*, so.order_no from demoagemapping as s left join demoquery as query on query._id = s.queryId  left join projectscreenerorder as so on so.studyId = s.studyId where so.screener_id = s.demographicId AND so.lang_code = '"+langCode+"' AND s.studyId ='"+SID+"' AND s.lang_code ='"+langCode+"'"
        queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                data.result = false;
                resolve(data);
            } else {
                if(result.length > 0) {

                    if((result[0].length > 0) || (result[1].length > 0)){
                     //  check for Queries and Options
                     let queries = [];
                     if(result[0].length>0){
                        for(var i = 0 ; i< result[0].length ; i++ ){
                        queries.push(result[0][i]);
                        }
                      }
                      getqueryOptions(queries ,function(optionsList){

                        for(var i = 0 ; i< queries.length ; i++ ){
                          let option = {} ;
                          option = optionsList[i];
                          queries[i].options = option;
                        }

                        let screenerRangeData = [];

                        if(result[1].length > 0){

                            for (let rangeData = 0; rangeData < result[1].length; rangeData++){
                            
                              
                              if(screenerRangeData.filter(data=>data.queryId===result[1][rangeData].queryId).length > 0){
                                // do not push the data into screenerRangeData
                                let myRangeOptions = {};
                                let myRangeArray = [];
                                myRangeOptions.ageTo = result[1][rangeData].ageTo;
                                myRangeOptions.ageFrom = result[1][rangeData].ageFrom;

                              let  index = screenerRangeData.findIndex(x => x.queryId ===result[1][rangeData].queryId);
                              myRangeArray = screenerRangeData[index].rangeOptions ; 
                              myRangeArray.push(myRangeOptions);
                              screenerRangeData[index].rangeOptions = myRangeArray;
                              }
                              else{
                                // push the data intpo range screener data
                                let myRangeOptions = {};
                                let myRangeArray = []
                                let rangeObj = result[1][rangeData];
                                myRangeOptions.ageTo = result[1][rangeData].ageTo;
                                myRangeOptions.ageFrom = result[1][rangeData].ageFrom;
                                
                                myRangeArray.push(myRangeOptions)
                                rangeObj.rangeOptions = myRangeArray;
                                screenerRangeData.push(rangeObj);

                              }
                            }
                        }

                        if(queries.length > 0 || screenerRangeData.length > 0){
                            data.result = true;
                            data.demographicData = queries;
                            data.screenerRangeData = screenerRangeData;
                            resolve(data);

                        }else{
                            data.result = false;
                            resolve(data);
                        }
                    
                    });
                    } else {
                        data.result = false;
                        resolve(data);
                    }
                } else {
                    data.result = false;
                    resolve(data);
                } 
            }
            });
    });
}

function getqueryOptions(queryList, optionsList){

    let Options = [];
    let tempPromise=[];
    for (key in queryList) {
    
    queryID = queryList[key].queryId;
  
    // Return new promise 
    tempPromise.push( new Promise(function(resolve, reject) {
  
        // Do async job
        let query ="select * from queryoptions where queryId ='"+queryID+"'"
         queryWrapper.execute(query, [], function (data) {
            
            Options[key] =  data;
            resolve(Options[key]);
        });     
    }));
  }
  
  Promise.all(tempPromise)
  .then(values => { 
    optionsList ( values);
  });
  }

module.exports= {
    getScreenersBySID : getScreenersBySID
}