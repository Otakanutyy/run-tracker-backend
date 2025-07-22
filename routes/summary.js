const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM summary_stats WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No summary found for user' });
    }

    const summary = result.rows[0];
    res.json({
      user_id: summary.user_id,
      total_runs: summary.total_runs,
      total_distance_km: summary.total_distance_km,
      avg_pace_min_per_km: summary.avg_pace_min_per_km
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch summary' });
  }
});

module.exports = router;
