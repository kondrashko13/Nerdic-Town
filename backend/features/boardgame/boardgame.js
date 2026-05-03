const mongoose = require('mongoose');

const BoardgameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    players: { type: String, required: true },
    playtime: { type: Number, required: true },
    age: { type: String, required: true },
    description: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Boardgame', BoardgameSchema);