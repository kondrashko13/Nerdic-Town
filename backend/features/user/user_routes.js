const express = require('express');
const router = express.Router();
const User = require('./user');
const { verifyToken, isAdmin } = require('../auth/middleware');

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('cart.productId');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/make-admin', verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role: 'admin' },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.json({
            message: 'User promoted to admin successfully',
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        if (req.user.userId === req.params.id) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;