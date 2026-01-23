require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Default Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index_organic.html'));
});

// Serve static files from current folder
app.use(express.static(path.join(__dirname, '/')));

// --- SOCKET.IO SETUP ---
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*", // allow all for prototype
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (data) => {
        const role = data.role;
        console.log(`User ${socket.id} joined as ${role}`);
        if (role === 'admin') {
            socket.join('admins');
        }
    });

    // Call Signaling
    socket.on('call-init', (data) => {
        // Data contains caller info request
        // We wait for signal from client now? 
        // Actually, simple-peer needs to generate signal first.
        // But for 'call-init', we might just notify admin to get ready?
        // Let's stick to: Client generates signal -> emits call-offer
        console.log('Call init (LEGACY) from', data.caller);
    });

    socket.on('call-offer', (data) => {
        console.log('Call offer from', data.callerName);
        io.to('admins').emit('call-offer', {
            callerId: socket.id,
            callerName: data.callerName,
            signal: data.signal // Pass WebRTC signal
        });
    });

    socket.on('call-answer', (data) => {
        console.log('Call answered by admin');
        io.to(data.callerId).emit('call-accepted', {
            adminId: socket.id,
            signal: data.signal // Pass WebRTC signal
        });
    });

    socket.on('call-end', (data) => {
        // Notify the other party if possible, or just broadcast to room if simple
        if (data && data.to) {
            io.to(data.to).emit('call-ended');
        } else {
            // If we don't know who to send to clearly in this simple proto, 
            // we might need to store call state. 
            // For now, let's rely on client passing the 'to' ID.
            // Or if it's an admin ending, broadcast to the caller logic?
            // Simplification: Clients will emit their peer ID.
        }
    });

    // Simple signaling for "end" - just pass it through
    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Built-in Node crypto for hashing
const crypto = require('crypto');

// Helper for hashing
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Test DB Connection & Auto-Migrate
pool.connect()
    .then(client => {
        console.log("Connected to Database");

        // 1. Markers Table (Existing)
        client.query(`
            CREATE TABLE IF NOT EXISTS markers (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255),
                address TEXT,
                lat DOUBLE PRECISION NOT NULL,
                lng DOUBLE PRECISION NOT NULL,
                notes TEXT,
                status VARCHAR(20) DEFAULT 'published',
                author VARCHAR(100),
                image TEXT,
                geom GEOMETRY(Point, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `).then(() => {
            // 2. Users Table (New)
            return client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role VARCHAR(20) DEFAULT 'user',
                    avatar VARCHAR(255),
                    points INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
        })
            .then(async () => {
                // Migration: Check for 'image' column in markers
                try {
                    const check = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='markers' AND column_name='image'");
                    if (check.rows.length === 0) {
                        console.log("Adding missing column 'image' to markers table...");
                        await client.query("ALTER TABLE markers ADD COLUMN image TEXT");
                    }
                } catch (e) {
                    console.error("Migration error (markers.image):", e);
                }
            })
            .then(() => console.log("Database Schema Sync Complete"))
            .catch(err => console.error("Migration Error", err))
            .finally(() => client.release());
    })
    .catch(err => console.error("DB Connection Error", err));


// --- AUTH ROUTES ---

// 1. Register
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const passwordHash = hashPassword(password);
        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, role, points, level;
        `;
        const result = await pool.query(query, [username, email, passwordHash]);

        res.json({
            success: true,
            message: "Account Created!",
            user: result.rows[0]
        });

    } catch (err) {
        console.error("Register Error:", err);
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: "Username or Email already exists" });
        }
        res.status(500).json({ error: "Server Error" });
    }
});

// 2. Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const passwordHash = hashPassword(password);
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const user = result.rows[0];

        if (user.password_hash !== passwordHash) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        // Return public user data
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                points: user.points,
                level: user.level,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --- API ROUTES ---

// Get All Markers
app.get('/api/markers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM markers');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Marker
app.post('/api/markers', async (req, res) => {
    const { type, lat, lng, title, address, notes, status, author, image } = req.body;
    try {
        const query = `
            INSERT INTO markers (type, lat, lng, title, address, notes, status, author, image, geom)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($3, $2), 4326))
            RETURNING *;
        `;
        const values = [type, lat, lng, title, address, notes, status, author, image];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Insert Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Update Marker
app.put('/api/markers/:id', async (req, res) => {
    const { id } = req.params;
    const { type, title, address, notes, status, image } = req.body;
    try {
        // Dynamic update
        let fields = [];
        let values = [];
        let idx = 1;

        if (type) { fields.push(`type=$${idx++}`); values.push(type); }
        if (title) { fields.push(`title=$${idx++}`); values.push(title); }
        if (address) { fields.push(`address=$${idx++}`); values.push(address); }
        if (notes) { fields.push(`notes=$${idx++}`); values.push(notes); }
        if (status) { fields.push(`status=$${idx++}`); values.push(status); }
        if (image) { fields.push(`image=$${idx++}`); values.push(image); }

        if (fields.length === 0) return res.status(400).json({ error: "No fields" });

        values.push(id);
        const query = `UPDATE markers SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).send('Marker not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Marker
app.delete('/api/markers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM markers WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Marker not found');
        }
        res.json({ message: 'Marker deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// --- ADMIN ROUTES ---

// 6. Get All Users (Admin Only)
app.get('/api/users', async (req, res) => {
    // In production, add middleware to verify admin token
    try {
        const query = `SELECT id, username, email, role, points, level, joined_at, avatar FROM users ORDER BY id ASC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 7. Update User Role (Promote/Ban)
app.put('/api/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'agent', 'user', 'banned'].includes(role)) {
        return res.status(400).json({ error: "Invalid Role" });
    }

    try {
        await pool.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, id]);
        res.json({ success: true, message: `User role updated to ${role}` });
    } catch (err) {
        console.error("Update Role Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 8. Export Markers (CSV)
app.get('/api/export/markers', async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, type, title, address, status, author, created_at FROM markers ORDER BY id ASC`);

        let csv = "ID,Type,Title,Address,Status,Author,Created At\n";
        result.rows.forEach(row => {
            csv += `${row.id},"${row.type}","${row.title || ''}","${row.address || ''}",${row.status},${row.author || 'Anonymous'},${row.created_at}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="ecomap_markers.csv"');
        res.send(csv);

    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).json({ error: "Export Failed" });
    }
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
