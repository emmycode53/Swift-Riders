const jwt = require('jsonwebtoken');
const userModel = require('../schema/userSchema')


const authenticateUser = async (req, res, next) => {
  
  try {
    const header = req.headers["authorization"]; 


    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(403)
        .send({ message: "Access denied, no token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    res.status(401).send({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;

module.exports = authenticateUser;