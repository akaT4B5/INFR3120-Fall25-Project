const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the header
    // We expect the frontend to send it as "x-auth-token"
    const token = req.header('x-auth-token');

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 3. Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the user from the payload to the request object
        req.user = decoded; 
        
        next(); // Move on to the actual route (e.g., Create Task)
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};