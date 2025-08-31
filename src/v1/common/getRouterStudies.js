
async function getRouterStudies( checkRouterUserID, TID, originParticipant){
    return new Promise(function(resolve, reject) {
        var query = "select rs.origin_study_id , rs.end_study_id from router_studies As rs \
        WHERE rs.user_id = '"+ checkRouterUserID +"' AND rs.vendor_id = '"+ TID +"' AND rs.origin_study_id = (SELECT origin_study_id from router_studies where Origion_participant_id = '"+ originParticipant +"' LIMIT 1)";

        queryWrapper.execute(query, [], function (result) {
            resolve(result);
        });
    });
}


module.exports= {
    getRouterStudies : getRouterStudies
}