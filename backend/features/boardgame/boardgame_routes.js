const express = require('express');
const router = express.Router();
const Boardgame = require('./boardgame');
const { verifyToken, isAdmin } = require('../auth/middleware');
const fs = require('fs');

router.post('/seed', verifyToken, isAdmin, async (req, res) => {
    try {
        const data = fs.readFileSync('./data/boardgames.json', 'utf-8');
        const boardGames = JSON.parse(data);

        await Boardgame.deleteMany();

        const importedGames = await Boardgame.insertMany(boardGames);

        res.status(201).json({
            message: 'Database seeded successfully',
            count: importedGames.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await Boardgame.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Boardgame.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Boardgame not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const newProduct = new Boardgame(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedProduct = await Boardgame.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Boardgame not found' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedProduct = await Boardgame.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Boardgame not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;