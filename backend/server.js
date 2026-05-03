require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Settings
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// RestAPI
app.use('/api/auth', require('./features/auth/auth_routes'));
app.use('/api/user', require('./features/user/user_routes'));
app.use('/api/boardgame', require('./features/boardgame/boardgame_routes'));

// Connection to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Connection error:', err));

// Run
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});

// Assets exposure
app.use('/data/images', express.static(path.join(__dirname, 'data/images')));
app.use('/data/images', (req, res) => {
    res.sendFile(path.join(__dirname, 'data/images/placeholder.png'));
});