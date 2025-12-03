const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

exports.authenticateToken = (req, res, next) => {
    // Get token from cookie or header
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Non authentifié.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId }; // Ensure this matches what you sign in authController
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token invalide.' });
    }
};
