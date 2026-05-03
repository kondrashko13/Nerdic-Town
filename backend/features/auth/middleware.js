const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };