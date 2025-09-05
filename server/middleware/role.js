// middleware/role.js
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.userRole !== role) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
    };
}

module.exports = { authorizeRole };