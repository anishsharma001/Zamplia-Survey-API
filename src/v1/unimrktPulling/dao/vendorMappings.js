const Vendor = require('../../participants/refactor/dao/Vendor');
const Mapping = require('../../participants/refactor/dao/Mapping');
const Study = require('../../participants/refactor/dao/Study');
const meta = require('../../config/meta.json');

async function vendorMapping(survey) {
    // 	Lucid
    let req1 = {};
    req1.body = new mappingStudy(survey, '7202011VENDOR1607321927050');
    if (req1.body !== undefined) {
        let poNewID = "";
        new mapVendor(req1, poNewID, function (data) { });
    }

    // mcq
    let req4 = {};
    req4.body = new mappingStudy(survey, '2420212VENDOR1616592262014');
    if (req4.body !== undefined) {
        let poNewID = "";
        new mapVendor(req4, poNewID, function (data) { });
    }

    //Prodege
    // let req3 = {};
    // req3.body = new mappingStudy(survey, '7202011VENDOR1607322159095');
    // req3.quotas = [];
    // if (req3.body !== undefined) {
    //     let poNewID = "";
    //     new mapVendor(req3, poNewID, function (data) { });
    // }

    // pure spacturm
    // let req6 = {};
    // req6.body = new mappingStudy(survey, '2420201VENDOR1582554920786');
    // req6.quotas = [];
    // if (req6.body !== undefined) {
    //     let poNewID = "";
    //     new mapVendor(req6, poNewID, function (data) { });
    // }

}
function mappingStudy(survey, vendorId) {
    this.studyId = survey[0];
    this.thirdPartyId = vendorId;
    this.studyUrl = survey[4];
    this.testUrl = survey[5];
    this.requirement = 100;
    this.vendorCpi = parseFloat(survey[6]) * .6;
}
function mapVendor(req, poNewID, resolve) {

    var mapping = new Mapping(req.body.thirdPartyId, req.body.studyId);
    var studyId = req.body.studyId
    let quotas = req.quotas
    var vendorCpiToInsert = req.body.vendorCpi;

    mapping.getThirdParyAndStudyMapping(function (mappingData, msg) {
        if (msg === meta.sqlError) {
            logger.error(`Error while reading mapping table`)
            let rPromiseData = {};
            rPromiseData.success = false;
            rPromiseData.error = mappingData;
            rPromiseData.message = "Error While getting mapping of merchant.";
            resolve(rPromiseData);
        } else if (mappingData.length > 0) {
            let rPromiseData = {};
            rPromiseData.success = false;
            rPromiseData.message = "This merchant is already mapped with this project.";
            resolve(rPromiseData);
        } else {

            var vendor = new Vendor(req.body.thirdPartyId);
            vendor.getVendorById(function (thirdPartyData, msg) {
                if (msg === meta.sqlError) {
                    logger.error(`Error while reading vendor table`)
                    let rPromiseData = {};
                    rPromiseData.success = false;
                    rPromiseData.error = thirdPartyData;
                    rPromiseData.message = "Error While Creating Third Party Mapping";
                    resolve(rPromiseData);
                } else if (thirdPartyData.length > 0) {

                    var d = new Date();
                    var timeNow = d.getTime();
                    var dateNow = d.getDate();
                    var month = d.getMonth();
                    var yearNow = d.getFullYear();
                    var newID = "" + dateNow + yearNow + month + "Map" + timeNow;
                    var column = ' _id, studyId, thirdPartyId, successUrl, 	terminateUrl, overQuotaUrl, securityTerminate, studyUrl, studyTestUrl, createdAt, updatedAt, requirement, totalQuota, vendorCpi, po, isQuotaEnabled';
                    var queryInsertion = "INSERT INTO mappings (" + column + ") VALUES ?";
                    let addedVariables = "";
                    if (thirdPartyData[0].variable1 === "") { } else {
                        addedVariables = thirdPartyData[0].variable1 + "=XXXXXXXX";
                        if (thirdPartyData[0].variable2 === "") { } else {
                            addedVariables = addedVariables + "&" + thirdPartyData[0].variable2 + "=XXXXXXXX";
                            if (thirdPartyData[0].variable3 === "") { } else {
                                addedVariables = addedVariables + "&" + thirdPartyData[0].variable3 + "=XXXXXXXX";
                            }
                        }
                    }

                    var query = "";

                    query = "SELECT orignalRequirment FROM studies  WHERE _id = '" + studyId + "'";

                    var study = new Study(studyId);
                    study.getStudyById(function (study, msg) {
                        if (msg === meta.sqlError) {
                            let rPromiseData = {};
                            rPromiseData.success = true;
                            rPromiseData.error = study;
                            resolve(rPromiseData);
                        } else {

                            let totalQuota = study[0].orignalRequirment * req.body.requirement / 100;
                            let query = "Select * from mappings where studyId ='" + req.body.studyId + "'";
                            queryWrapper.execute(query, [], function (mapping) {
                                if (mapping.errno && mapping.errno !== undefined) {
                                    let rPromiseData = {};
                                    rPromiseData.success = true;
                                    rPromiseData.error = mapping;
                                    resolve(rPromiseData);
                                } else {

                                    let q = ""
                                    if (studyId.includes('unimrkt') && quotas !== undefined) {
                                        q = `[` + quotas.map(x => `"${x}"`) + `]`
                                    }
                                    let vendorSuccessUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlSuccess, q !== "" ? q : studyId);
                                    let vendorTerminateUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlTerminated, q !== "" ? q : studyId);
                                    let vendorOverQuotaUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlOverQuota, q !== "" ? q : studyId);
                                    let vendorSecurityUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlSecurityTermination, q !== "" ? q : studyId);

                                    if (mapping.length > 0) {

                                        let acquiredQuota = 0;
                                        for (let i = 0; i < mapping.length; i++) {
                                            acquiredQuota = acquiredQuota + mapping[i].requirement;
                                        }

                                        if (acquiredQuota + parseInt(req.body.requirement) > 1000000000) {
                                            let rPromiseData = {};
                                            rPromiseData.success = false;
                                            logger.info("Total quota on this project is exceeding. Please enter correct requirement that fits into your project.")
                                            rPromiseData.message = "Total quota on this project is exceeding. Please enter correct requirement that fits into your project.";
                                            resolve(rPromiseData);
                                        } else {

                                            var mapping = new Mapping(req.body.thirdPartyId, studyId);
                                            queryWrapper.execute(queryInsertion, [[[newID, studyId, req.body.thirdPartyId, vendorSuccessUrl, vendorTerminateUrl,
                                                vendorOverQuotaUrl, vendorSecurityUrl, req.body.studyUrl, req.body.testUrl, d, d, req.body.requirement, totalQuota, vendorCpiToInsert, poNewID, 1]]], function (saveMapping) {
                                                    if (saveMapping.errno && saveMapping.errno !== undefined) {
                                                        let rPromiseData = {};
                                                        rPromiseData.success = false;
                                                        rPromiseData.error = saveMapping;
                                                        rPromiseData.message = "Error While Creating Third Party Mapping";
                                                        resolve(rPromiseData);
                                                    } else {
                                                        mapping.getThirdParyAndStudyMapping(function (data, msg) { });
                                                        let rPromiseData = {};
                                                        rPromiseData.success = true;
                                                        rPromiseData.message = "Merchant Mapping Is Successfull";
                                                        resolve(rPromiseData);
                                                    }
                                                });
                                        }

                                    } else {

                                        queryWrapper.execute(queryInsertion, [[[newID, studyId, req.body.thirdPartyId, vendorSuccessUrl, vendorTerminateUrl,
                                            vendorOverQuotaUrl, vendorSecurityUrl, req.body.studyUrl, req.body.testUrl, d, d, req.body.requirement, totalQuota, vendorCpiToInsert, poNewID, 1]]], function (saveMapping) {
                                                if (saveMapping.errno && saveMapping.errno !== undefined) {
                                                    let rPromiseData = {};
                                                    rPromiseData.success = false;
                                                    rPromiseData.error = saveMapping;
                                                    rPromiseData.message = "Error While Creating Third Party Mapping";
                                                    resolve(rPromiseData);
                                                } else {
                                                    let rPromiseData = {};
                                                    rPromiseData.success = true;
                                                    rPromiseData.message = "Merchant Mapping Is Successfull";
                                                    resolve(rPromiseData);
                                                }
                                            });
                                    }
                                }
                            }
                            );
                        }
                    }
                    );
                } else {
                    let rPromiseData = {};
                    rPromiseData.success = false;
                    rPromiseData.message = "This merchant is not available.";
                    resolve(rPromiseData);
                }
            });
        }
    });
}

function rplaceQuotaId(url, quotaId) {
    return String(url).replace("<quotaId>", quotaId);
}

module.exports = {
    vendorMapping
}
