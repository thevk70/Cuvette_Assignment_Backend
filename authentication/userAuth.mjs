import jwt from "jsonwebtoken";

// Middleware to authenticate JWT and compare expiry
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {        
        return res.status(401).json({ message: 'Access denied. No token provided.',type:"error" });
    }

    // Verify the token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.',type:"error" });
        }

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decoded.exp < currentTime) {
            return res.status(401).json({ message: 'Token has expired. Please login again.',type:"error" });
        }

        req.user = decoded; // Attach the decoded token payload to the request object
        next();
    });
};

export default authenticateToken;
