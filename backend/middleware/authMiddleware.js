const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    //Get the token from the header
    // Frontend to send it as "x-auth-token"
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
        // not logged in
    }

    //Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the user from the payload to the request object
        req.user = decoded; 
        
        next(); // error message
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
        // login expired
    }
};