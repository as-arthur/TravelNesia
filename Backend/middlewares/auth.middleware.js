const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
  
    token = req.headers.authorization.split(' ')[1];
  } 
  
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Tidak ada izin untuk mengakses route ini'
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia123');

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Tidak ada izin untuk mengakses route ini'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User dengan role ${req.user.role} tidak diizinkan mengakses route ini`
      });
    }
    next();
  };
};
