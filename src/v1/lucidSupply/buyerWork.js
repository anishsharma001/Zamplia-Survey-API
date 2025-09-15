const { execute } = require('../../database/queryWrapperMysql');
const { getLucidAllSurveys, getAllAllocatedSurveys } = require("./services/lucidServices");
const { getLangIdFromDb } = require("./model/lucidmodel");

async function luicdSurveyPriority(req, res) {
    // First, get existing buyers with priority = -1
    try {

        let lang_code = req.body.lang_code
        let type = req.body.type

        // Validate required parameters
        if (!lang_code || !type) {
            return res.send({
                success: false,
                message: "lang_code and type are required"
            })
        }

        // Validate type parameter
        if (type !== 1 && type !== 2) {
            return res.send({
                success: false,
                message: "type must be 1 (buyer analysis) or 2 (survey analysis)"
            })
        }

        const { lucidLangId } = await getLangIdFromDb(lang_code);

        if (!lucidLangId) {
            return res.send({
                success: false,
                message: "lucidLangId is not passing"
            })
        }

        let { Surveys: allLiveSurveys } = await getLucidAllSurveys(lucidLangId, '', '', '', '', '', '');

        let getAllocatedSurveys = await getAllAllocatedSurveys(lucidLangId);

        let surveysList = [...allLiveSurveys, ...getAllocatedSurveys];

        let buyersWithPriorityMinusOne = await getBuyersWithPriorityMinusOne();

        const skipBuyers = new Set(buyersWithPriorityMinusOne.map(b => b.buyername));

        let surveys = surveysList.map(x => ({
            SurveyNumber: x.SurveyNumber,
            AccountName: x.AccountName
        }));

        let getCompleteStudy = await getCompleteStudies(lang_code);

        // merge correctly
        surveys = [...surveys, ...getCompleteStudy];

        // make unique by SurveyNumber
        surveys = Object.values(
            surveys.reduce((acc, cur) => {
                acc[cur.SurveyNumber] = cur;
                return acc;
            }, {})
        );

        // Create a map for faster survey lookup
        const surveyMap = new Map();
        surveys.forEach(survey => {
            surveyMap.set(survey.SurveyNumber, survey);
        });

        // Object to store buyer-wise statistics (only if type = 1)
        let buyerAnalysis = {};

        // Object to store survey-wise statistics (only if type = 2)
        let surveyAnalysis = {};

        // Process data in batches
        const BATCH_SIZE = 1000;
        let offset = 0;
        let hasMoreData = true;

        const CompleteTermsBatch = await getCompleteTermsBatch(lang_code);

        // Process current batch
        for (let index = 0; index < CompleteTermsBatch.length; index++) {
            const element = CompleteTermsBatch[index];
            let refsid = +element.refsid;
            let status = +element.status;

            if (!refsid) {
                continue
            }

            // Process survey analysis if type = 2
            if (type === 2) {
                // Initialize survey analysis for this refsid
                if (!surveyAnalysis[refsid]) {
                    surveyAnalysis[refsid] = {
                        totalCount: 0,
                        statusCounts: {},
                        buyerName: null
                    };
                }

                // Increment survey total count
                surveyAnalysis[refsid].totalCount++;

                // Track survey status
                if (status) {
                    if (!surveyAnalysis[refsid].statusCounts[status]) {
                        surveyAnalysis[refsid].statusCounts[status] = 0;
                    }
                    surveyAnalysis[refsid].statusCounts[status]++;
                }
            }

            // Use map for O(1) lookup instead of find
            let survey = surveyMap.get(refsid);

            if (survey) {
                let buyerName = survey.AccountName;

                // Store buyer name for survey if type = 2
                if (type === 2 && !surveyAnalysis[refsid].buyerName) {
                    surveyAnalysis[refsid].buyerName = buyerName;
                }

                // Process buyer analysis if type = 1
                if (type === 1) {
                    // Skip if buyer has priority = -1
                    if (skipBuyers.has(buyerName)) {
                        continue;
                    }

                    // Initialize buyer object if not exists
                    if (!buyerAnalysis[buyerName]) {
                        buyerAnalysis[buyerName] = {
                            totalCount: 0,
                            clientStatusCounts: {},
                            marketplaceStatusCounts: {},
                            statusCounts: {}
                        };
                    }

                    // Increment total count
                    buyerAnalysis[buyerName].totalCount++;

                    // Track general status
                    if (status) {
                        if (!buyerAnalysis[buyerName].statusCounts[status]) {
                            buyerAnalysis[buyerName].statusCounts[status] = 0;
                        }
                        buyerAnalysis[buyerName].statusCounts[status]++;
                    }
                }
            }
        }

        // Calculate percentages and prepare upsert data based on type
        let buyerSurveyCount = {};
        let upsertData = [];
        let surveySurveyCount = {};
        let surveyUpsertData = [];

        // Process buyer analysis if type = 1
        if (type === 1) {
            for (const [buyerName, data] of Object.entries(buyerAnalysis)) {
                buyerSurveyCount[buyerName] = {
                    totalCount: data.totalCount,
                    clientStatus: {},
                    marketplaceStatus: {},
                    status: {},
                    priority: 9 // default priority
                };

                // Calculate general status percentages
                for (const [status, count] of Object.entries(data.statusCounts)) {
                    buyerSurveyCount[buyerName].status[status] = {
                        count: count,
                        percentage: ((count / data.totalCount) * 100).toFixed(2) + '%'
                    };
                }

                const statusOneCount = data.statusCounts['1'] || 0;
                const statusOnePercentage = (statusOneCount / data.totalCount) * 100;

                let priority = 10;
                if (statusOnePercentage > 30) {
                    priority = 1;
                } else if (statusOnePercentage > 25) {
                    priority = 2;
                } else if (statusOnePercentage > 20) {
                    priority = 3;
                } else if (statusOnePercentage > 15) {
                    priority = 4;
                } else if (statusOnePercentage > 13) {
                    priority = 5;
                } else if (statusOnePercentage > 10) {
                    priority = 6;
                } else if (statusOnePercentage > 8) {
                    priority = 7;
                } else if (statusOnePercentage > 5) {
                    priority = 8;
                } else if (statusOnePercentage > 2) {
                    priority = 9;
                } else if (statusOnePercentage < 1) {
                    priority = -2;
                }

                buyerSurveyCount[buyerName].priority = priority;
                buyerSurveyCount[buyerName].statusOnePercentage = statusOnePercentage.toFixed(2) + '%';

                // Prepare data for upsert
                upsertData.push([buyerName, priority, 1]);
            }
        }

        // Process survey analysis if type = 2
        if (type === 2) {
            for (const [refsid, data] of Object.entries(surveyAnalysis)) {
                // Only process surveys with at least some data
                if (data.totalCount === 0 || !data.buyerName) {
                    continue;
                }

                let clientSurvey = surveysList.find(d => d.SurveyNumber == refsid)

                let clientConverstion = clientSurvey && clientSurvey.Conversion ? clientSurvey.Conversion : 0
                let clientLengthOfInterview = clientSurvey && clientSurvey.LengthOfInterview ? clientSurvey.LengthOfInterview : 0

                surveySurveyCount[refsid] = {
                    totalCount: data.totalCount,
                    buyerName: data.buyerName,
                    status: {},
                    conversionRate: 0,
                    clientConverstion: clientConverstion,
                    clientLengthOfInterview: clientLengthOfInterview,
                };

                // Calculate status percentages
                for (const [status, count] of Object.entries(data.statusCounts)) {
                    surveySurveyCount[refsid].status[status] = {
                        count: count,
                        percentage: ((count / data.totalCount) * 100).toFixed(2) + '%'
                    };
                }

                const statusOneCount = data.statusCounts['1'] || 0;
                const conversionRate = (statusOneCount / data.totalCount) * 100;

                const statusThreeCount = data.statusCounts['3'] || 0;
                const terminationRate = (statusThreeCount / data.totalCount) * 100;

                surveySurveyCount[refsid].conversionRate = conversionRate.toFixed(2);
                surveySurveyCount[refsid].statusOneCount = statusOneCount;

                surveySurveyCount[refsid].terminationRate = terminationRate.toFixed(2);
                surveySurveyCount[refsid].statusThreeCount = statusThreeCount;

                if ((conversionRate > 10 && data.totalCount > 20) && terminationRate < 50) {
                    // Prepare survey data for upsert
                    surveyUpsertData.push([
                        refsid,
                        data.buyerName || 'Unknown',
                        data.totalCount,
                        statusOneCount,
                        conversionRate.toFixed(2),
                        terminationRate.toFixed(2),
                        lang_code,
                        1,
                        clientConverstion
                    ]);
                }

            }

            // Sort surveys by conversion rate to identify best performers
            surveyUpsertData.sort((a, b) => parseFloat(b[4]) - parseFloat(a[4]));
        }

        // Perform batch upsert to database based on type
        try {
            // Process buyer data if type = 1
            if (type === 1 && upsertData.length > 0) {
                const UPSERT_BATCH_SIZE = 1000;

                await execute('update lucid_buyer_name_priority set is_active = 0 where id > 0;', []);

                // Upsert buyer priorities
                for (let i = 0; i < upsertData.length; i += UPSERT_BATCH_SIZE) {
                    const batch = upsertData.slice(i, i + UPSERT_BATCH_SIZE);
                    const placeholders = batch.map(() => '(?, ?, ?)').join(', ');
                    const values = batch.flat();

                    const batchUpsertQuery = `
                    INSERT INTO lucid_buyer_name_priority (buyername, priority, is_active) 
                        VALUES ${placeholders}
                    ON DUPLICATE KEY UPDATE 
                        priority = IF(lucid_buyer_name_priority.priority < 0, lucid_buyer_name_priority.priority, VALUES(priority)),
                        updatedAt = IF(lucid_buyer_name_priority.priority < 0, lucid_buyer_name_priority.updatedAt, CURRENT_TIMESTAMP),
                        is_active = IF(lucid_buyer_name_priority.priority < 0, lucid_buyer_name_priority.is_active, VALUES(is_active))
                    `;

                    await execute(batchUpsertQuery, values);
                }
            }

            // Process survey data if type = 2
            if (type === 2 && surveyUpsertData.length > 0) {
                const SURVEY_UPSERT_BATCH_SIZE = 1000;

                // First, deactivate all existing records for this lang_code
                await execute('UPDATE lucid_survey_performance SET is_active = 0 WHERE lang_code = ?;', [lang_code]);

                // Insert/update survey performance data
                for (let i = 0; i < surveyUpsertData.length; i += SURVEY_UPSERT_BATCH_SIZE) {
                    const batch = surveyUpsertData.slice(i, i + SURVEY_UPSERT_BATCH_SIZE);
                    const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                    const values = batch.flat();

                    const surveyUpsertQuery = `
                    INSERT INTO lucid_survey_performance 
                        (refsid, buyer_name, total_count, success_count, conversion_rate, termination_rate, lang_code, is_active, client_conversion) 
                        VALUES ${placeholders}
                                        ON DUPLICATE KEY UPDATE 
                        buyer_name = VALUES(buyer_name),
                        total_count = VALUES(total_count),
                        success_count = VALUES(success_count),
                        conversion_rate = VALUES(conversion_rate),
                        termination_rate = VALUES(termination_rate),
                        is_active = VALUES(is_active),
                        client_conversion = VALUES(client_conversion),
                        updatedAt = CURRENT_TIMESTAMP
                    `;

                    await execute(surveyUpsertQuery, values);
                }
            }

            // Return response based on type
            if (type === 1) {
                return res.send({
                    success: true,
                    type: "buyer_analysis",
                    message: "Buyer analysis completed successfully"
                });
            } else if (type === 2) {
                return res.send({
                    success: true,
                    message: "Survey analysis completed successfully"
                });
            }

        } catch (error) {
            console.error('Database upsert error:', error);
            return res.send({
                success: false,
                error: error.message,
                type: type === 1 ? "buyer_analysis" : "survey_analysis"
            })
        }

    } catch (error) {
        console.error('General error:', error);
        return res.send({
            success: false,
            error: error.message
        })
    }
}

async function getCompleteTermsBatch(lang_code) {
    const query = ` SELECT 
                        p.refsid, 
                        p.status
                    FROM participants p
                    LEFT JOIN studies s ON s.apisurveyid = p.refsid AND s.lang_code = 'En-US'
                    LEFT JOIN client_term_status c ON c.pid = p.p_id
                    WHERE p.apitype = 8
                        AND p.createdAt >=  NOW() - INTERVAL 1 DAY
                        and c.status != -1 order by c.id desc`;
    const result = await execute(query, [lang_code]);
    return result;
}

async function getCompleteStudies(lang_code) {
    const query = `select s.lucidClientName as AccountName, s.apiSurveyId as SurveyNumber, createdAt from 
                    studies s 
                    where s.apiClientId = 10 and s.lang_code = ?
                    and s.createdAt >=  NOW() - INTERVAL 1 DAY`;
    const result = await execute(query, [lang_code]);
    return result;
}

async function getBuyersWithPriorityMinusOne() {
    const query = `
        SELECT buyername 
        FROM lucid_buyer_name_priority 
        WHERE priority = -1
    `;
    const result = await execute(query);
    return result;
}

module.exports = {
    luicdSurveyPriority,
};