const pool = require('../db');

async function updateSummary(user_id) {
  await pool.query(`
    INSERT INTO summary_stats (
      user_id,
      total_runs,
      total_distance_km,
      avg_pace_min_per_km,
      updated_at
    )
    SELECT
      user_id,
      COUNT(*),
      SUM(distance_km),
      ROUND(AVG(pace_min_per_km)::numeric, 2),
      NOW()
    FROM runs
    WHERE user_id = $1
    GROUP BY user_id
    ON CONFLICT (user_id) DO UPDATE SET
      total_runs = EXCLUDED.total_runs,
      total_distance_km = EXCLUDED.total_distance_km,
      avg_pace_min_per_km = EXCLUDED.avg_pace_min_per_km,
      updated_at = EXCLUDED.updated_at
  `, [user_id]);
}

module.exports = updateSummary;
