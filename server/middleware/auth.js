const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) return res.status(401).json({ message: 'No token, access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // save user ID for later
        req.userRole = decoded.role;
        next(); // move to the next step (the route)
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = auth;