require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

function parseDataFile(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf8');
        // Extract array content using simple regex assuming standard format
        // Matches: const variableName = [...]; or var variableName = [...];
        const match = content.match(/=\s*(\[[\s\S]*\])/);
        if (match && match[1]) {
            // Safety: handling JS objects that might not be strict JSON (keys without quotes)
            // Using Function constructor to evaluate strictly the array part
            // "return " + match[1] gives us the array
            const safeEval = new Function('return ' + match[1]);
            return safeEval();
        }
    } catch (e) {
        console.error(`Error parsing ${filename}:`, e.message);
    }
    return [];
}

async function migrate() {
    console.log("Starting Migration...");

    // 1. Load Data
    const containers = parseDataFile('containers.js');
    const markers = parseDataFile('markers.js');
    const korgans = parseDataFile('korgans.js');

    console.log(`Found: ${containers.length} containers, ${markers.length} markers, ${korgans.length} korgans.`);

    const allItems = [...containers, ...markers, ...korgans];

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Optional: Clear table first to avoid duplicates if re-running
        // await client.query('TRUNCATE TABLE markers RESTART IDENTITY'); 

        for (const item of allItems) {
            // Normalize data fields
            const type = item.type || 'Unknown';
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lng);
            const title = item.title || item.location || 'Untitled';
            const address = item.address || '';
            const status = item.status || 'published';
            const author = item.author || 'system';

            // Skip invalid coordinates
            if (isNaN(lat) || isNaN(lng)) continue;

            const query = `
                INSERT INTO markers (type, title, address, lat, lng, status, author, geom)
                VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($5, $4), 4326))
            `;

            await client.query(query, [type, title, address, lat, lng, status, author]);
        }

        await client.query('COMMIT');
        console.log(`Successfully migrated ${allItems.length} items to database!`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration Failed:", e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
