// Load environment variables from a .env file
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// --- Database Connection ---
// The connection details will be read from environment variables
// that you set in your OpenShift deployment.
// The SSL configuration has been removed to allow non-SSL connections
// to the internal OpenShift database.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- API Routes ---

// Initialize Database Table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB
      );
    `);
    console.log('Database table checked/created successfully.');
  } catch (err) {
    console.error('Error initializing database table', err.stack);
  }
};

// GET /api/leaderboard - Fetches top 10 players
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT data ->> 'displayName' as name, 
              (data -> 'leaderboardStats' ->> 'avgWpm')::int as wpm,
              (data -> 'leaderboardStats' ->> 'accuracy')::int as accuracy,
              (data -> 'leaderboardStats' ->> 'totalWords')::int as totalWords
       FROM players 
       ORDER BY wpm DESC, accuracy DESC 
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST /api/player - Creates or retrieves a player
app.post('/api/player', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  try {
    const { rows } = await pool.query('SELECT data FROM players WHERE id = $1', [id]);
    if (rows.length > 0) {
      // Player exists, return data
      res.json(rows[0].data);
    } else {
      // New player, send back null so the front-end can prompt for a name
      res.json(null);
    }
  } catch (err) {
    console.error('Error checking player data:', err);
    res.status(500).json({ error: 'Error checking player data' });
  }
});

// POST /api/save - Saves player data
app.post('/api/save', async (req, res) => {
  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ error: 'Player ID and data are required' });
  }

  try {
    // Use an "upsert" operation: insert if new, update if exists.
    const query = `
      INSERT INTO players (id, data)
      VALUES ($1, $2)
      ON CONFLICT (id)
      DO UPDATE SET data = $2;
    `;
    await pool.query(query, [id, data]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to save player data:', err);
    res.status(500).json({ error: 'Failed to save player data' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  initDb(); // Check for the database table on startup
});
