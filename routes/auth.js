const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      console.log("No user found");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    console.log("User found:", user.email);
    console.log("Hashed password in DB:", user.password_hash);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ message: 'Login successful', user_id: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
