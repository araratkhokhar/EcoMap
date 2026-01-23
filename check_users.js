
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkUsers() {
    try {
        const res = await pool.query('SELECT id, username, email, role, password_hash FROM users');
        console.log("Users in DB:", res.rows);
    } catch (err) {
        console.error("Error querying users:", err);
    } finally {
        pool.end();
    }
}

checkUsers();
