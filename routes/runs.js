const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const updateSummary = require('../utils/updateSummary');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', upload.single('photo'), async (req, res) => {
  const {
    user_id,    
    distance_km,
    time_minutes,
    location_text,
    latitude,
    longitude
  } = req.body;

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO runs (user_id, distance_km, time_minutes, location_text, latitude, longitude, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, distance_km, time_minutes, location_text, latitude || null, longitude || null, photoUrl]
    );
    
    //upd summary
    await updateSummary(user_id);

    res.status(201).json({ message: 'Run saved', run: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save run' });
  }
});

router.get('/:id', async (req, res) => {
  const runId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM runs WHERE id = $1', [runId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Run not found' });
    }

    const run = result.rows[0];
    res.json({
      id: run.id,
      user_id: run.user_id,
      run_date: run.run_date,
      distance_km: run.distance_km,
      time_minutes: run.time_minutes,
      pace_min_per_km: run.pace_min_per_km,
      location: run.location_text,
      latitude: run.latitude,
      longitude: run.longitude,
      photo_url: run.photo_url ? `http://localhost:3000${run.photo_url}` : null,
      map_link: (run.latitude && run.longitude)
        ? `https://www.openstreetmap.org/?mlat=${run.latitude}&mlon=${run.longitude}#map=15/${run.latitude}/${run.longitude}`
        : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch run' });
  }
});


router.get('/', async (req, res) => {
  const { user_id } = req.query;

  try {
    let result;
    if (user_id) {
      result = await pool.query('SELECT * FROM runs WHERE user_id = $1 ORDER BY run_date DESC', [user_id]);
    } else {
      result = await pool.query('SELECT * FROM runs ORDER BY run_date DESC');
    }

    const runs = result.rows.map(run => ({
      id: run.id,
      user_id: run.user_id,
      run_date: run.run_date,
      location: run.location_text,
      distance_km: run.distance_km,
      time_minutes: run.time_minutes,
      pace_min_per_km: run.pace_min_per_km,
      photo_url: run.photo_url ? `http://localhost:3000${run.photo_url}` : null,
      map_link: (run.latitude && run.longitude)
        ? `https://www.openstreetmap.org/?mlat=${run.latitude}&mlon=${run.longitude}#map=15/${run.latitude}/${run.longitude}`
        : null
    }));

    res.json(runs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch runs' });
  }
});


module.exports = router;
