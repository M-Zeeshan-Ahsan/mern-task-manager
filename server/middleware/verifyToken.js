import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.send({
      success: false,
      message: "Token required",
    });
  }

  jwt.verify(token, "Google", (err, decoded) => {
    if (err) {
      return res.send({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = decoded;
    next();
  });
};

export default verifyToken;
