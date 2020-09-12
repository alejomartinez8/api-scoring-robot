const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('middleware/validate-request');
const authorize = require('middleware/authorize');
const Role = require('helpers/role');
const userService = require('../../services/user/user.service');

module.exports = router;

// Register, verify email, forgot password routes
router.post('/login', loginSchema, login);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);

// Get verb
router.get('/', authorize(), getUser);
router.get('/getAll', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);

// Post, put, delete verb
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

// login validate middleware
function loginSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

// login user with email and password
function login(req, res, next) {
  const { email, password } = req.body;
  userService
    .login({ email, password })
    .then((token) => {
      res.json(token);
    })
    .catch(next);
}

// register validation
function registerSchema(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    institution: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    bio: Joi.string(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    acceptTerms: Joi.boolean().valid(true).required()
  });
  validateRequest(req, next, schema);
}

/** Register an user and send and email to verifiy the user,
 * the first User is an Admin Role, the other are just User,
 * if the email exist send and email again
 */
function register(req, res, next) {
  userService
    .register(req.body, req.get('origin'))
    .then(() =>
      res.json({
        message: 'Registro exitoso, por revisa tu Email con el enlace de verificación'
      })
    )
    .catch(next);
}

/**
 * Verify email validation
 */
function verifyEmailSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

/**
 * Verify email with token sent to email
 */
function verifyEmail(req, res, next) {
  userService
    .verifyEmail(req.body)
    .then(() => res.json({ message: 'Veriricación exitosa ahora puedes ingresar' }))
    .catch(next);
}

/**
 * forgot password validate
 */
function forgotPasswordSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  validateRequest(req, next, schema);
}

/**
 * Send a token for 24 hours of validate to reset the password
 */
function forgotPassword(req, res, next) {
  userService
    .forgotPassword(req.body, req.get('origin'))
    .then(() =>
      res.json({
        message:
          'Por favor revisa tu correo electrónico para recibir instrucciones de como restablecer tu contraseña'
      })
    )
    .catch(next);
}

/**
 * Validate reset password Schema
 */
function resetPasswordSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  });
  validateRequest(req, next, schema);
}

/**
 * Validate the Reset token sent to email
 */
function validateResetToken(req, res, next) {
  userService
    .validateResetToken(req.body)
    .then(() => res.json({ message: 'Token válido' }))
    .catch(next);
}

/**
 * Validate Schema the reset token sent to email to create new password
 */
function validateResetTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

/**
 * Validate the reset token sent to email to create new password
 */
function resetPassword(req, res, next) {
  userService
    .resetPassword(req.body)
    .then(() => res.json({ message: 'Contraseña exitosa ya puede acceder' }))
    .catch(next);
}

// Get user
function getUser(req, res, next) {
  userService
    .getById(req.user.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);
}

//  Get all users-user
function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
}

// Get User by Id
function getById(req, res, next) {
  // users can get their own user and admins can get any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);
}

// Validate User Schema
function createSchema(req, res, next) {
  console.log('createSchema');
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    institution: Joi.string().empty(''),
    city: Joi.string().empty(''),
    country: Joi.string().empty(''),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().valid(Role.Admin, Role.Judge, Role.User).required()
  });
  validateRequest(req, next, schema);
}

// Create an User
function create(req, res, next) {
  console.log('create controller');
  userService
    .create(req.body)
    .then((user) => res.json(user))
    .catch(next);
}

// Validate User Schema
function updateSchema(req, res, next) {
  const schemaRules = {
    firstName: Joi.string().empty(''),
    lastName: Joi.string().empty(''),
    email: Joi.string().email().empty(''),
    password: Joi.string().min(6).empty(''),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
    institution: Joi.string().empty(''),
    city: Joi.string().empty(''),
    country: Joi.string().empty(''),
    bio: Joi.string().empty('')
  };

  // only admins can update role
  if (req.user.role === Role.Admin) {
    schemaRules.role = Joi.string().valid(Role.Admin, Role.Judge, Role.User).empty('');
  }

  const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
  validateRequest(req, next, schema);
}

// Update user by ID
function update(req, res, next) {
  // users can update their own user and admins can update any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  userService
    .update(req.params.id, req.body)
    .then((user) => res.json(user))
    .catch(next);
}

/**
 * Delete user
 */
function _delete(req, res, next) {
  // users can delete their own user and admins can delete any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService
    .delete(req.params.id)
    .then(() => res.json({ message: 'User deleted successfully' }))
    .catch(next);
}
