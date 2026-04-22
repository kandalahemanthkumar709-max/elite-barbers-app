const authorizeUser = (roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ error: 'Unauthorized access' });
        }
    };
};

module.exports = authorizeUser;
