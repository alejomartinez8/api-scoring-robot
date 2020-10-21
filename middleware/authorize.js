const jwt = require('express-jwt');
const { secret } = require('../config');
const db = require('../helpers/db');

// @params  Can be a single role string (e.g. Role.User or 'User') or an array of roles (e.g [Role.Admin, Role.User] or ['Admin', 'user])
// @desc    Authorize middleware, validate role and token if exist

function authorize(roles = []) {
  // console.log(roles);
  // convert string to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // authenticate JWT token and attach user to request object (req.user)
    jwt({ secret, algorithms: ['HS256'] }),

    // athorized based on user role
    async (req, res, next) => {
      const user = await db.User.findById(req.user.id);

      if (!user || (roles.length && !roles.includes(user.role))) {
        //user no longer exists or role not authorized
        return res.status(401).json({ message: 'No autorizado' });
      }

      // authentication and authorization successful
      req.user.role = user.role;
      next();
    }
  ];
}

module.exports = authorize;
