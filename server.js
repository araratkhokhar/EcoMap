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

// Test DB Connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL Database');
    release();
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
    const { type, lat, lng, title, address, notes, status, author } = req.body;
    try {
        const query = `
            INSERT INTO markers (type, lat, lng, title, address, notes, status, author, geom)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($3, $2), 4326))
            RETURNING *;
        `;
        const values = [type, lat, lng, title, address, notes, status, author];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Marker
app.put('/api/markers/:id', async (req, res) => {
    const { id } = req.params;
    const { type, title, address, notes, status } = req.body;
    try {
        const query = `
            UPDATE markers 
            SET type = $1, title = $2, address = $3, notes = $4, status = $5
            WHERE id = $6
            RETURNING *;
        `;
        const values = [type, title, address, notes, status, id];
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

// Start Server
// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
