const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('middleware/validate-request');
const authorize = require('middleware/authorize');
const Role = require('helpers/role');
const authService = require('../services/auth.service');

module.exports = router;

// Register, verify email, forgot password routes
router.post('/login', loginSchema, login);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);

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
  authService
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
  authService
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
  authService
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
  authService
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
  authService
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
  authService
    .resetPassword(req.body)
    .then(() => res.json({ message: 'Contraseña exitosa ya puede acceder' }))
    .catch(next);
}
