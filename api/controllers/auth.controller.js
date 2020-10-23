const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const passport = require('../../middleware/passport');

module.exports = router;

// Register, verify email, forgot password routes
router.post('/login', login);
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);
router.post('/google/token', passport.authenticate('google-token'), authGoogleToken);
router.post('/facebook/token', passport.authenticate('facebook-token'), authFacebookToken);
router.post('/testEmailConfig', testEmailConfig);

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
 * Verify email with token sent to email
 */
function verifyEmail(req, res, next) {
  authService
    .verifyEmail(req.body)
    .then(() => res.json({ message: 'Verificación exitosa ahora puedes ingresar' }))
    .catch(next);
}

/**
 * Send a token for 24 hours of validate to reset the password
 */
function forgotPassword(req, res, next) {
  authService
    .forgotPassword(req.body, req.get('origin'))
    .then(() =>
      res.json({
        message: 'Por favor revisa tu correo electrónico para recibir instrucciones de como restablecer tu contraseña'
      })
    )
    .catch(next);
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
 * Validate the reset token sent to email to create new password
 */
function resetPassword(req, res, next) {
  authService
    .resetPassword(req.body)
    .then(() => res.json({ message: 'Contraseña exitosa ya puede acceder' }))
    .catch(next);
}

function authFacebookToken(req, res, next) {
  authService
    .authFacebookToken(req.user)
    .then((token) => {
      res.json(token);
    })
    .catch(next);
}

function authGoogleToken(req, res, next) {
  authService
    .authGoogleToken(req.user)
    .then((token) => {
      res.json(token);
    })
    .catch(next);
}

function testEmailConfig(req, res, next) {
  authService
    .testEmailConfig(req.body.email)
    .then((response) => res.json(response))
    .catch(next);
}
