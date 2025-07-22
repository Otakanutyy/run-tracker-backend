require('dotenv').config();

const cors = require('cors');
const express = require('express');
const path    = require('path');

const authRoutes = require('./routes/auth');
const runRoutes  = require('./routes/runs');
const summaryRoutes = require('./routes/summary');
const app = express();
app.use(cors());  
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/summary', summaryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
