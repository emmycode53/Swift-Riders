const authorizedUser = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: "Not authenticated" });
    }

    
    if (!req.user.role || (Array.isArray(allowedRoles) &&!allowedRoles.includes(req.user.role))) {
      return res
        .status(403)
        .send({ message: "Forbidden, you don't have permission" });
    }

    next();
  };
};

module.exports = authorizedUser;


