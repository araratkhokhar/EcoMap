require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Railway requires SSL for external connections
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function parseDataFile(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf8');
        const match = content.match(/=\s*(\[[\s\S]*\])/);
        if (match && match[1]) {
            const safeEval = new Function('return ' + match[1]);
            return safeEval();
        }
    } catch (e) {
        console.error(`Error parsing ${filename}:`, e.message);
    }
    return [];
}

async function deployToCloud() {
    console.log("🚀 Starting Cloud Deployment...");
    const client = await pool.connect();

    try {
        // STEP 1: Run Setup (Create Tables)
        console.log("1️⃣  Initializing Database Schema...");
        const setupSql = fs.readFileSync('setup.sql', 'utf8');
        await client.query(setupSql);
        console.log("✅ Schema created successfully.");

        // STEP 2: Migrate Data
        console.log("2️⃣  Migrating Data (This may take a moment)...");

        const containers = parseDataFile('containers.js');
        const markers = parseDataFile('markers.js');
        const korgans = parseDataFile('korgans.js');
        const allItems = [...containers, ...markers, ...korgans];

        console.log(`   Found ${allItems.length} items to upload.`);

        await client.query('BEGIN');

        let count = 0;
        for (const item of allItems) {
            const type = item.type || 'Unknown';
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lng);
            const title = item.title || item.location || 'Untitled';
            const address = item.address || '';
            const status = item.status || 'published';
            const author = item.author || 'system';

            if (isNaN(lat) || isNaN(lng)) continue;

            const query = `
                INSERT INTO markers (type, title, address, lat, lng, status, author, geom)
                VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($5, $4), 4326))
            `;
            await client.query(query, [type, title, address, lat, lng, status, author]);
            count++;
            if (count % 500 === 0) console.log(`   ...uploaded ${count} items`);
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully uploaded ${count} markers to Cloud DB!`);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Deployment Failed:", e);
    } finally {
        client.release();
        pool.end();
    }
}

deployToCloud();
