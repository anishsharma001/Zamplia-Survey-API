const { execute } = require('../../database/queryWrapperMysql');

function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const escapeStr = s => (s || '').replace(/'/g, "\\'");

async function insertVendorReconsilation() {
    try {

        //  const startDatel = '2025-11-15 01:00:00';
        // const endDatel = '2026-01-15 00:00:00';

        const now = new Date();
        const start = now.getDate() >= 15
            ? new Date(now.getFullYear(), now.getMonth(), 15)
            : new Date(now.getFullYear(), now.getMonth() - 1, 15);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 15);

        // current month cycle
        const startDate = fmtDate(start);
        const endDate = fmtDate(end);

        // last month cycle (start -1 month)
        const lastStart = new Date(start.getFullYear(), start.getMonth() - 1, 15);
        const lastEnd = new Date(start.getFullYear(), start.getMonth(), 15);
        const lastStartDate = fmtDate(lastStart);
        const lastEndDate = fmtDate(lastEnd);

        // older month cycle (start -2 months)
        const olderStart = new Date(start.getFullYear(), start.getMonth() - 2, 15);
        const olderEnd = new Date(start.getFullYear(), start.getMonth() - 1, 15);
        const olderStartDate = fmtDate(olderStart);
        const olderEndDate = fmtDate(olderEnd);

        // example:
        // current:   ${startDate} .. ${endDate}
        // last:      ${lastStartDate} .. ${lastEndDate}
        // older:     ${olderStartDate} .. ${olderEndDate}

        // vendors
        const vendorQuery = `
            SELECT _id as vendorId, vendorName, vendor_category
            FROM vendors
            WHERE vendor_category IN ('Group A', 'Group B', 'Group C')
        `;
        const vendors = await execute(vendorQuery);
        if (!vendors || vendors.length === 0) return [];

        const vendorMap = new Map(vendors.map(v => [v.vendorId, v]));
        const vendorIdsList = vendors.map(v => `'${v.vendorId}'`).join(',');

        // calibr8 scores (avg) -> map vendorId::langCode -> avgScore
        // const calibr8Result = [];
        const calibr8Result = await getCalibr8ScoreByGroup(vendors);
        const calibr8Map = (calibr8Result || []).reduce((m, r) => {
            m[`${r.vendorId}::${r.langCode}`] = Number(r.avgScore) || 0;
            return m;
        }, {});

        // single grouped recon query for all vendors for the cycle
        const reconQuery = `
            SELECT 
                p.tid AS vendorId,
                s.lang_code,
                COUNT(p.p_id) AS TotalParticipants,
                SUM(CASE WHEN (p.status = 1) THEN 1 ELSE 0 END) AS TotalCompletes,
                SUM(CASE WHEN (p.status = 1) THEN p.cpi ELSE 0 END) AS Revenue,
                SUM(CASE WHEN (p.status = 1) THEN p.vendorCpi ELSE 0 END) AS Expense,
                SUM(CASE WHEN (p.status = 1 AND p.finalReconcileStatus = 25) THEN 1 ELSE 0 END) AS NegativeReconciliation,
                SUM(CASE WHEN (p.status != 1 AND p.finalReconcileStatus = 1) THEN 1 ELSE 0 END) AS PositiveReconciliation
            FROM participants p
            LEFT JOIN studies s ON p.sid = s._id
            WHERE p.tid IN (${vendorIdsList})
                AND p.createdAt >= '${startDate}'
                AND p.createdAt < '${endDate}'
                AND s.apitype = 1
            GROUP BY p.tid, s.lang_code
        `;
        const reconResults = await execute(reconQuery);
        const surveeyParticipantsQuery = `
            SELECT 
                p.vid AS vendorId,
                survey_country as lang_code,
                COUNT(p.id) AS TotalParticipants
            FROM survey_participants p
            WHERE p.vid IN (${vendorIdsList})
                AND p.created_At >= '${startDate}'
                AND p.created_At < '${endDate}'
                AND p.is_api_survey = 1
            GROUP BY p.vid, survey_country
        `;
        const totalUser = await execute(surveeyParticipantsQuery);

        // prepare bulk inserts
        const inserts = [];
        for (const row of (reconResults || [])) {

            let surveyParticipants = totalUser.find(t => t.vendorId === row.vendorId && t.lang_code === row.lang_code);
            let surveyParticipantsCount = surveyParticipants ? Number(surveyParticipants.TotalParticipants) : 0;

            if (!surveyParticipantsCount || !(row.lang_code)) {
                continue
            }

            const vendorId = row.vendorId;
            const lang_code = row.lang_code || '';
            const key = `${vendorId}::${lang_code}`;
            const calibr8Score = calibr8Map[key] || 0;
            const vendor = vendorMap.get(vendorId) || {};
            const vendorName = escapeStr(vendor.vendorName || '');
            const vendorCategory = escapeStr(vendor.vendor_category || '');
            const TotalParticipants = Number(surveyParticipantsCount) || 0;
            const Revenue = Number(row.Revenue) || 0;
            const Expense = Number(row.Expense) || 0;
            const TotalCompletes = Number(row.TotalCompletes) || 0;
            const NegativeReconciliation = Number(row.NegativeReconciliation) || 0;
            const PositiveReconciliation = Number(row.PositiveReconciliation) || 0;

            let threshold = 0;

            if (vendorCategory === 'Group A') {
                threshold = 0;
            } else if (vendorCategory === 'Group B') {
                threshold = 90;
            } else if (vendorCategory === 'Group C') {
                threshold = 95;
            }

            inserts.push(`('${vendorId}','${vendorName}','${vendorCategory}',${TotalParticipants},${Revenue},${Expense},'${lang_code}',${Number(calibr8Score)},${TotalCompletes}, ${PositiveReconciliation}, ${NegativeReconciliation},
                ${threshold}, '${endDate}')`);
        }

        if (inserts.length > 0) {
            const insertQuery = `
                INSERT INTO vendor_category_summary
                    (tid, vendorName, vendorCategory, TotalParticipants, Revenue, Expense, lang_code, calibar8_score, TotalComplete, PositiveReconciliation, NegativeReconciliation, threshold, created_at)
                VALUES ${inserts.join(',')}
            `;
            await execute(insertQuery);
        }

        // summary adjustments and thresholds
        const vendorCategorySummaryQuery = `
            SELECT 
                id, tid, vendorName, vendorCategory, TotalParticipants, Revenue, Expense, TotalComplete, 
                PositiveReconciliation, NegativeReconciliation, lang_code, calibar8_score, manualCalibr8Score, created_at, updatedAt, currentMonthRecon, lastMonthRecon, olderMonthRecon, threshold
            FROM vendor_category_summary
            WHERE created_at = '${endDate}'
        `;
        const vendorCategorySummary = await execute(vendorCategorySummaryQuery);

        const vendorCategorySummaryQueryLast = `
            SELECT 
                tid, lang_code, currentMonthRecon
            FROM vendor_category_summary
            WHERE created_at = '${lastEndDate}'
        `;
        const vendorCategorySummaryLast = await execute(vendorCategorySummaryQueryLast);

        const vendorCategorySummaryQueryOlder = `
            SELECT 
                tid, lang_code, lastMonthRecon
            FROM vendor_category_summary
            WHERE created_at = '${olderEndDate}'
        `;
        const vendorCategorySummaryOlder = await execute(vendorCategorySummaryQueryOlder);

        const bulkUpdates = {
            // Key: unique combo of SET values, Value: array of ids
            reconciliation: [],  // {id, currentMonthRecon, lastMonthRecon, olderMonthRecon}
            groupChanges: []     // {id, vendorName, threshold}
        };

        // Collect all updates
        for (const s of (vendorCategorySummary || [])) {
            const aid = s.id;
            const tid = s.tid;
            const vendorName = s.vendorName;
            const TotalComplete = Number(s.TotalComplete) || 0;
            const NegativeReconciliation = Number(s.NegativeReconciliation) || 0;
            const currentMonthRecon = Number(s.currentMonthRecon) || 0;
            let lastMonthReconValue = vendorCategorySummaryLast.find(v => v.tid === s.tid && v.lang_code === s.lang_code);
            let olderMonthReconValue = vendorCategorySummaryOlder.find(v => v.tid === s.tid && v.lang_code === s.lang_code);
            const lastMonthRecon = Number(lastMonthReconValue ? lastMonthReconValue.currentMonthRecon : 0) || 0;
            const olderMonthRecon = Number(olderMonthReconValue ? olderMonthReconValue.olderMonthRecon : 0) || 0;
            const threshold = Number(s.threshold) || 0;
            if (!TotalComplete) {
                bulkUpdates.reconciliation.push({
                    id: aid,
                    currentMonthRecon: 0,
                    lastMonthRecon,
                    olderMonthRecon,
                });
                continue;
            }

            const reconcilationRate = (NegativeReconciliation / TotalComplete) * 100;

            bulkUpdates.reconciliation.push({
                id: aid,
                currentMonthRecon: reconcilationRate,
                lastMonthRecon,
                olderMonthRecon,
            });

            // Determine group/threshold changes
            if (vendorName === 'Group A') {
                if (reconcilationRate > 12 && lastMonthRecon > 12 && olderMonthRecon > 12) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group B', threshold: 90 });
                    await moveVendorGroup(tid, 'Group A', 'Group B')
                } else if (reconcilationRate > 12 && lastMonthRecon > 12) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group A', threshold: 80 });
                } else if (reconcilationRate > 12) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group A', threshold: 50 });
                } else if (reconcilationRate < 12 && threshold == 50) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group A', threshold: 0 });
                } else if (reconcilationRate < 12 && lastMonthRecon < 12 && threshold == 80) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group A', threshold: 50 });
                }
            } else if (vendorName === 'Group B') {
                if (reconcilationRate > 20 && lastMonthRecon > 20) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group C', threshold: 95 });
                    await moveVendorGroup(tid, 'Group B', 'Group C')
                } else if (reconcilationRate > 20) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group B', threshold: 95 });
                } else if (reconcilationRate < 12 && lastMonthRecon < 12) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group A', threshold: 0 });
                    await moveVendorGroup(tid, 'Group B', 'Group A')
                }
            } else {
                if (reconcilationRate >= 11 && reconcilationRate <= 20
                    && lastMonthRecon >= 11 && lastMonthRecon <= 20
                    && olderMonthRecon >= 11 && olderMonthRecon <= 20) {
                    bulkUpdates.groupChanges.push({ id: aid, vendorName: 'Group B', threshold: 90 });
                    await moveVendorGroup(tid, 'Group C', 'Group B')
                }
            }
        }

        // Execute bulk reconciliation update using CASE statements
        const BATCH_SIZE = 500;

        if (bulkUpdates.reconciliation.length > 0) {
            for (let i = 0; i < bulkUpdates.reconciliation.length; i += BATCH_SIZE) {
                const batch = bulkUpdates.reconciliation.slice(i, i + BATCH_SIZE);
                const ids = batch.map(r => `'${r.id}'`).join(',');

                const currentMonthCases = batch.map(r => `WHEN id = '${r.id}' THEN ${r.currentMonthRecon}`).join(' ');
                const lastMonthCases = batch.map(r => `WHEN id = '${r.id}' THEN ${r.lastMonthRecon}`).join(' ');
                const olderMonthCases = batch.map(r => `WHEN id = '${r.id}' THEN ${r.olderMonthRecon}`).join(' ');

                await execute(`
                    UPDATE vendor_category_summary
                    SET currentMonthRecon = CASE ${currentMonthCases} ELSE currentMonthRecon END,
                        lastMonthRecon = CASE ${lastMonthCases} ELSE lastMonthRecon END,
                        olderMonthRecon = CASE ${olderMonthCases} ELSE olderMonthRecon END
                    WHERE id IN (${ids})
                `);
            }
        }

        // Execute bulk group/threshold changes
        if (bulkUpdates.groupChanges.length > 0) {
            for (let i = 0; i < bulkUpdates.groupChanges.length; i += BATCH_SIZE) {
                const batch = bulkUpdates.groupChanges.slice(i, i + BATCH_SIZE);
                const ids = batch.map(r => `'${r.id}'`).join(',');

                const hasVendorNameChanges = batch.some(r => r.vendorName !== null);

                const thresholdCases = batch.map(r => `WHEN id = '${r.id}' THEN ${r.threshold}`).join(' ');

                let vendorNameSet = '';
                if (hasVendorNameChanges) {
                    const vendorNameCases = batch.map(r =>
                        `WHEN id = '${r.id}' THEN ${r.vendorName !== null ? `'${r.vendorName}'` : 'vendorName'}`
                    ).join(' ');
                    vendorNameSet = `vendorName = CASE ${vendorNameCases} ELSE vendorName END,`;
                }

                await execute(`
            UPDATE vendor_category_summary
            SET ${vendorNameSet}
                threshold = CASE ${thresholdCases} ELSE threshold END
            WHERE id IN (${ids})
        `);
            }
        }

        console.log('All thing is done');


        return vendors;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const moveVendorGroup = async (
    vendorId,
    fromGroup,
    toGroup,
    actionType,
    performedBy,
) => {
    try {
        const query = `UPDATE vendor_category_summary SET vendorCategory = ? WHERE tid = ?`;
        const updateResult = (await execute(query, [toGroup, vendorId]));
        if (!updateResult?.affectedRows) {
            return { success: false, message: "Failed to move vendor!" };
        }
        const logQuery = `INSERT INTO vendor_category_summary_log (vendorId, fromGroup, toGroup, actionType, performedBy) VALUES (?, ?, ?, ?, ?)`;
        await execute(logQuery, [vendorId, fromGroup, toGroup, 'Vendor Group Move', 'SYSTEM']);

        return {
            success: true,
            message: `Vendor Group moved successfully from ${fromGroup} to ${toGroup}`,
        };
    } catch (error) {
        return { success: false, message: "Server error" };
    }
};


async function getCalibr8ScoreByGroup(vendors) {
    try {
        // Step 1: Get vendors

        if (!vendors || vendors.length === 0) return [];
        // Step 2: Date range
        const now = new Date();
        const start = now.getDate() >= 15
            ? new Date(now.getFullYear(), now.getMonth(), 15)
            : new Date(now.getFullYear(), now.getMonth() - 1, 15);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 15);

        // Step 3: Create chunks
        const VENDOR_CHUNK_SIZE = 2;
        const vendorChunks = chunkArray(vendors, VENDOR_CHUNK_SIZE);
        const weeklyChunks = getWeeklyChunks(start, end);

        console.log(`Processing: ${vendorChunks.length} vendor chunks x ${weeklyChunks.length} weekly chunks = ${vendorChunks.length * weeklyChunks.length} total queries`);

        // Step 4: Process each combo sequentially
        const aggregatedMap = {};

        for (let v = 0; v < vendorChunks.length; v++) {
            const vendorIdsList = vendorChunks[v].map(v => `'${v.vendorId}'`).join(',');

            for (let w = 0; w < weeklyChunks.length; w++) {
                const chunkStart = fmtDate(weeklyChunks[w].start);
                const chunkEnd = fmtDate(weeklyChunks[w].end);

                console.log(`Vendor chunk ${v + 1}/${vendorChunks.length} | Week ${w + 1}/${weeklyChunks.length} | ${chunkStart} to ${chunkEnd}`);

                const query = `
                    SELECT 
                        s.lang_code AS langCode,
                        cs.vid AS vendorId,
                        cs.overall_score AS score
                    FROM project_calibr8_response cs
                    INNER JOIN studies s ON s._id = cs.sid
                    WHERE s.apitype = 1 AND cs.created_at >= '${chunkStart}'
                        AND cs.created_at < '${chunkEnd}'
                        AND cs.vid IN (${vendorIdsList})
                        AND cs.overall_score IS NOT NULL
                `;

                const rows = await execute(query);

                if (rows && rows.length > 0) {
                    for (const row of rows) {
                        const key = `${row.langCode}::${row.vendorId}`;

                        if (!aggregatedMap[key]) {
                            aggregatedMap[key] = {
                                langCode: row.langCode,
                                vendorId: row.vendorId,
                                totalScore: 0,
                                count: 0
                            };
                        }

                        aggregatedMap[key].totalScore += parseFloat(row.score);
                        aggregatedMap[key].count += 1;
                    }
                }
            }
        }

        // Step 5: Calculate averages
        const results = Object.values(aggregatedMap).map(entry => ({
            langCode: entry.langCode,
            vendorId: entry.vendorId,
            avgScore: entry.count > 0
                ? parseFloat((entry.totalScore / entry.count).toFixed(2))
                : 0
        }));

        console.log(`Final results: ${results.length} lang-vendor combinations`);
        return results;

    } catch (err) {
        console.error('Error in getCalibr8ScoreByGroup:', err);
        return [];
    }
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function getWeeklyChunks(startDate, endDate) {
    const chunks = [];
    let current = new Date(startDate);
    // const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const DAYS = 31;
    const CHUNK_MS = DAYS * 24 * 60 * 60 * 1000;

    while (current < endDate) {
        const chunkEnd = new Date(
            Math.min(current.getTime() + CHUNK_MS, endDate.getTime())
        );
        chunks.push({
            start: new Date(current),
            end: new Date(chunkEnd)
        });
        current = chunkEnd;
    }
    return chunks;
}

module.exports = {
    insertVendorReconsilation
};
