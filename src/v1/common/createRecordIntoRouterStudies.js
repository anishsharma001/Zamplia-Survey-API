/**
 * This will create router studies record whenever a router participant given to participant.
 */
async function createRecordIntoRouterStudies(origin_study_id, 
    end_study_id, 
    user_id,
    participant_id,
    vendor_id, 
    Origion_participant_id){

        let resultData = [];
        return new Promise(function(resolve, reject) {
            var date = new Date();
            var components = [ date.getYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
            var newID = components.join("")+"Router";

            var column = ' router_id, origin_study_id, end_study_id, user_id, participant_id, createdAt, vendor_id, Origion_participant_id';
            var query = "INSERT INTO router_studies (" + column + ") VALUES ?";
                        
            queryWrapper.execute(query, [[[ newID, origin_study_id, end_study_id, user_id, participant_id, new Date, vendor_id , Origion_participant_id]]], function (result) {
                if (result.errno && result.errno !== undefined) {
                    let data = {};
                    data.success = false;
                    resultData.push(data);
                    resolve(resultData);
                } else {
                    let data = {};
                    data.success = true;
                    resultData.push(data);
                    resolve(resultData);
                }
            }); 
        });
}
module.exports= {
    createRecordIntoRouterStudies : createRecordIntoRouterStudies
}