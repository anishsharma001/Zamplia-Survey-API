const Study = require('../participants/refactor/dao/Study')
const getSurveys = require('../precisionCrons/getSurveysByCountry');
const log4js = require('../common/logger');
const logger = log4js.getLogger('updateLucidStudies');
const meta = require('../config/meta.json')
const redis = require('../middlewares/redisClient');

exports.updateLucidStudies = async function (req) {
    let surveyId = req.query.surveyId;
    let status = req.query.status;
    let precisionSurveyId = req.query.precisionSurveyId;
    let res = await getSurveys.getLucidSurvey(surveyId);
    return new Promise(function (resolve, reject) {



        let result = {};

        if (surveyId !== 'undefined') {
            //let res =  getSurveys.getLucidSurvey(surveyId);
            if (res.success === false) {
                result = { 'message': `Study  is invalid for lucid` }
                resolve(result);
            }
            else {
                //set status=02 to hold on lucid
                redis.removeOne(`study~sid_${precisionSurveyId}`)
                if (res.surveys.SurveyStatusCode === status) {
                    result = { 'message': `Study ${surveyId} already having status code: ${status}  at lucid ` }
                    resolve(result)

                }
                else {
                    switch (status) {
                        case "02":
                            new Study(`${precisionSurveyId}`).getStudyById(function (data, msg) {
                                if (msg === meta.sqlError) {
                                    logger.error('error while reading study table' + msg)
                                } else {
                                    if (data.length > 0) {
                                        if (data[0].status !== 'Live') {
                                            res.surveys.SurveyStatusCode = "02";
                                            getSurveys.updateLucidSurvey(res.surveys)
                                            logger.info(`Study ${surveyId} status code :${status} updated  at lucid `)
                                            resolve(`Study ${surveyId} status code :${status} updated  at lucid `)
                                        } else {
                                            res.surveys.SurveyStatusCode = "02";
                                            getSurveys.updateLucidSurvey(res.surveys)
                                            logger.info(`Study ${surveyId} status code is :${data[0].status} at Precision.It cannot be paused at Lucid `)
                                            logger.info(`Study ${surveyId} status code is :${data[0].status} at Precision.Forcefully pausing at lucid. `)
                                            //resolve(`Study ${surveyId} statu code :${data[0].status} at Precision.It cannot be paused at Lucid `)
                                            resolve(`Study ${surveyId} statu code :${data[0].status} at Precision.Forcefully pausing at lucid `)
                                        }
                                    } else {
                                        res.surveys.SurveyStatusCode = "02";
                                        getSurveys.updateLucidSurvey(res.surveys)
                                        logger.info(`No record for ${surveyId} at out end.Pausing at lucid `)
                                        resolve(`No record for ${surveyId} at out end.Pausing at lucid`)
                                    }
                                }

                            });

                            break;
                        case "03":
                            new Study(`${precisionSurveyId}`).getStudyById(function (data, msg) {
                                if (msg === meta.sqlError) {
                                    logger.error('error while reading study table' + msg)
                                } else {
                                    if (data[0].status === 'Live') {
                                        res.surveys.SurveyStatusCode = "03";
                                        getSurveys.updateLucidSurvey(res.surveys)
                                        resolve(`Study ${surveyId} status code :${status} updated  at lucid `)
                                    } else {

                                        logger.info(`Study ${surveyId} status code is :${data[0].status} at Precision.We cannot make live at Lucid `)
                                        resolve(`Study ${surveyId} statu code :${data[0].status} at Precision.We cannot make live at Lucid `)
                                    }
                                }
                            });
                            break;
                        case "04":
                            new Study(`${precisionSurveyId}`).getStudyById(function (data, msg) {
                                if (msg === meta.sqlError) {
                                    logger.error('error while reading study table' + msg)
                                } else {
                                    if (data.length > 0) {
                                        if (res.surveys.SurveyStatusCode === "02") {
                                            res.surveys.SurveyStatusCode = "04";
                                            getSurveys.updateLucidSurvey(res.surveys)
                                            logger.info(`Survey ${surveyId}  :Marking complete at lucid `)
                                            resolve(`Survey ${surveyId}  :Marking complete at lucid `)
                                        } else{
                                            logger.info(`Survey ${surveyId}  is not having  paused status  at lucid `)
                                            resolve( `Survey ${surveyId}  can not paused  at lucid `)
                                        }
                                    } else {
                                        if (res.surveys.SurveyStatusCode === "02") {
                                            res.surveys.SurveyStatusCode = "04";
                                            getSurveys.updateLucidSurvey(res.surveys)
                                            logger.info(`No record for ${surveyId} at out end.Marking complete at lucid `)
                                            resolve(`No record for ${surveyId} at out end.Marking complete at lucid `)
                                        } else {
                                            logger.info(`No record for ${surveyId} at out end`)
                                            resolve(`No record for ${surveyId} at out end. `)
                                        }
                                    }
                                }

                            });
                            break;
                        default:
                            result = { 'message': `no action for status code :${status} ` }
                            resolve(result);
                    }


                    //getSurveys.updateLucidSurvey(res.surveys)
                    // result = { 'message': `Study ${surveyId} statu code :${status} updated  at lucid ` };
                    //resolve(result);
                }
            }
        } else {
            result = { 'message': `Missing query params !!` }
            resolve(result);
        }


    });


}

