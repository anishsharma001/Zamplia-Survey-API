const { execute } = require('../../database/queryWrapperMysql');
const { getLucidAllSurveys, getAllAllocatedSurveys } = require("./services/lucidServices");
const { getLangIdFromDb } = require("./model/lucidmodel");
async function luicdSurveyPriority(req, res) {
    // First, get existing buyers with priority = -1
    try {

        let lang_code = req.body.lang_code

        if (!lang_code) {
            return res.send({
                success: false
            })
        }

        const { lucidLangId } = await getLangIdFromDb(lang_code);

        if (!lucidLangId) {
            return res.send({
                success: false
            })
        }

        let { Surveys: allLiveSurveys } = await getLucidAllSurveys(lucidLangId, '', '', '', '', '', '');

        let getAllocatedSurveys = await getAllAllocatedSurveys(lucidLangId);

        let surveys = [...allLiveSurveys, ...getAllocatedSurveys];

        let buyersWithPriorityMinusOne = await getBuyersWithPriorityMinusOne();

        const skipBuyers = new Set(buyersWithPriorityMinusOne.map(b => b.buyername));

        surveys = surveys.map(x => ({
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


        // Object to store buyer-wise statistics
        let buyerAnalysis = {};

        // Process data in batches
        const BATCH_SIZE = 1000;
        let offset = 0;
        let hasMoreData = true;

        // while (hasMoreData) {
        // Get batch of CompleteTerms
        const CompleteTermsBatch = await getCompleteTermsBatch(lang_code);

        // if (CompleteTermsBatch.length < BATCH_SIZE) {
        //     hasMoreData = false;
        // }

        // Process current batch
        for (let index = 0; index < CompleteTermsBatch.length; index++) {
            const element = CompleteTermsBatch[index];
            let refsid = +element.refsid;
            let status = +element.status;

            if (!refsid) {
                continue
            }

            // Use map for O(1) lookup instead of find
            let survey = surveyMap.get(refsid);

            if (survey) {
                let buyerName = survey.AccountName;

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

        // Calculate percentages for each buyer and prepare upsert data
        let buyerSurveyCount = {};
        let upsertData = [];

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

        // Perform batch upsert to database
        try {
            if (upsertData.length > 0) {
                // Process upserts in batches too
                const UPSERT_BATCH_SIZE = 1000; // Smaller batch for inserts

                await execute('update lucid_buyer_name_priority set is_active = 0 where id > 0;', []);

                // Replace the batch upsert section with this:
                for (let i = 0; i < upsertData.length; i += UPSERT_BATCH_SIZE) {
                    const batch = upsertData.slice(i, i + UPSERT_BATCH_SIZE);
                    const placeholders = batch.map(() => '(?, ?, ?)').join(', ');
                    const values = batch.flat();

                    // Updated query to handle both -1 and -2 priorities (or any negative priority)
                    const batchUpsertQuery = `
                    INSERT INTO lucid_buyer_name_priority (buyername, priority, is_active) 
                        VALUES ${placeholders}
                    ON DUPLICATE KEY UPDATE 
                        priority = IF(lucid_buyer_name_priority.priority < 0, lucid_buyer_name_priority.priority, VALUES(priority)),
                        updatedAt = IF(lucid_buyer_name_priority.priority < 0, lucid_buyer_name_priority.updatedAt, CURRENT_TIMESTAMP),
                        is_active = IF(lucid_buyer_name_priority.priority < 0, lucid_buyer_name_priority.is_active, VALUES(is_active))
                    `;

                    // Add await here
                    await execute(batchUpsertQuery, values);
                }

                return res.send({
                    success: true
                })
            }
        } catch (error) {
            return res.send({
                success: false
            })
        }

        return buyerSurveyCount;
    } catch (error) {
        return res.send({
            success: false
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