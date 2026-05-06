import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied — no token provided' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.admin = {
            adminId: decoded.adminId,
            username: decoded.username,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Session expired — please login again',
                code: 'TOKEN_EXPIRED',
                redirect: '/login',
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token — unauthorized',
                code: 'TOKEN_INVALID',
            });
        }
        return res.status(401).json({
            message: 'Authentication failed',
            code: 'AUTH_FAILED',
        });
    }
};

export default authMiddleware;
