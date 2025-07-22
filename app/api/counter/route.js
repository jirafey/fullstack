// File: my-simple-fullstack/app/api/route.js

import { Pool } from 'pg';
import { NextResponse } from 'next/server'; // Import NextResponse

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Helper function to ensure the table and initial data exist
async function ensureTableExists() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS counters (
        id SERIAL PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )
    `);
    await client.query(`
      INSERT INTO counters (id, value) VALUES (1, 0)
      ON CONFLICT (id) DO NOTHING
    `);
  } finally {
    client.release();
  }
}

// This function handles GET requests to /api/route
export async function GET() {
  try {
    await ensureTableExists();
    const client = await pool.connect();
    const result = await client.query('SELECT value FROM counters WHERE id = 1');
    client.release();
    // Use NextResponse.json to send a JSON response
    return NextResponse.json({ count: result.rows[0]?.value || 0 });
  } catch (err) {
    console.error('GET Error:', err);
    // Return an error response
    return NextResponse.json({ error: 'Failed to get counter value' }, { status: 500 });
  }
}

// This function handles POST requests to /api/route
export async function POST(request) {
  try {
    const { action } = await request.json(); // Get the request body
    let newCount;

    await ensureTableExists();
    const client = await pool.connect();

    // Use a transaction for safety
    await client.query('BEGIN');
    const currentValRes = await client.query('SELECT value FROM counters WHERE id = 1 FOR UPDATE');
    let currentValue = currentValRes.rows[0]?.value || 0;

    if (action === 'increment') {
      newCount = currentValue + 1;
    } else if (action === 'decrement') {
      newCount = currentValue - 1;
    } else {
      await client.query('ROLLBACK');
      client.release();
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updateRes = await client.query('UPDATE counters SET value = $1 WHERE id = 1 RETURNING value', [newCount]);
    await client.query('COMMIT');
    client.release();

    return NextResponse.json({ count: updateRes.rows[0].value });
  } catch (err) {
    console.error('POST Error:', err);
    return NextResponse.json({ error: 'Failed to update counter value' }, { status: 500 });
  }
}
