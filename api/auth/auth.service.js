const config = require('../../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../../helpers/send-email');
const db = require('../../helpers/db');
const Role = require('../../helpers/role');
const { response } = require('express');

module.exports = {
  login,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  authGoogleToken,
  authFacebookToken,
  testEmailConfig
};

/**
 * login Service
 */
async function login({ email, password }) {
  const user = await db.User.findOne({ email });

  if (!user) {
    throw 'Email not registered';
  }

  if (!user.isVerified) {
    throw 'Email not verified, please check your email';
  }

  if (!bcrypt.compareSync(password, user.passwordHash)) {
    throw 'Email or password is incorrect';
  }

  // authentication successful so generate jwt and refresh tokens
  const token = generateJwtToken(user);

  // return basic details and tokens
  return { token };
}

/** Google Auth Token */
async function authGoogleToken(user) {
  if (!user) {
    throw 'Usuario Google no encontrado';
  }
  // authentication successful so generate jwt and refresh tokens
  const token = generateJwtToken(user);

  // return basic details and tokens
  return { token };
}

/** Facebook Auth Token */
async function authFacebookToken(user) {
  if (!user) {
    throw 'Usuario Facebook no encontrado';
  }
  // authentication successful so generate jwt and refresh tokens
  const token = generateJwtToken(user);

  // return basic details and tokens
  return { token };
}

/**
 * Register an user to create an user
 */
async function register(params, origin) {
  if (await db.User.findOne({ email: params.email })) {
    // send already registered error in email to prevent user enumeration
    await sendAlreadyRegisteredEmail(params.email, origin);
    throw 'Email ya registrado, revisa tu correo electrónico para restablecer tu contraseña';
  }

  // create user object
  const user = new db.User(params);

  // first registered user is an admin
  const isFirstUser = (await db.User.countDocuments({})) === 0;
  user.role = isFirstUser ? Role.Admin : Role.User;
  user.verificationToken = randomTokenString();

  // hash password
  user.passwordHash = hash(params.password);

  // save user
  await user.save();

  // send email
  await sendVerificationEmail(user, origin);
}

// With the token sent to email, verify the user to access to the API
async function verifyEmail({ token }) {
  const user = await db.User.findOne({ verificationToken: token });

  if (!user) throw 'Verification failed';

  user.verified = Date.now();
  // user.verificationToken = undefined; //Delete Verification Token but and verified field with Date in DB
  await user.save();
}

// Find email on DB if exist, if yes send and email with reset Token
async function forgotPassword({ email }, origin) {
  const user = await db.User.findOne({ email });

  // always return ok response to prevent email enumeration
  if (!user) {
    console.log('email not exists');
    return;
  }

  // create reset token that expires after 24 hours
  user.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
  await user.save();

  // send email
  await sendPasswordResetEmail(user, origin);
}

// Find on DB the token in 'resetToken' field
async function validateResetToken({ token }) {
  const user = await db.User.findOne({
    'resetToken.token': token,
    'resetToken.expires': { $gt: Date.now() }
  });

  if (!user) throw 'Invalid token';
}

// reset Password
async function resetPassword({ token, password }) {
  const user = await db.User.findOne({
    'resetToken.token': token,
    'resetToken.expires': { $gt: Date.now() }
  });

  if (!user) throw 'Invalid token';

  // update password and remove reset token
  user.passwordHash = hash(password);
  user.passwordReset = Date.now();
  user.resetToken = undefined;
  await user.save();
}

async function testEmailConfig(email) {
  console.log(email);
  if (!email) {
    throw 'No hay dirección de correo electrónico';
  }

  const res = await sendEmail({
    to: email,
    subject: 'Correo de Prueba',
    html: '<p>Correo de Prueba desde Gmail</p>'
  });

  console.log({ res });
}

/**
 * Hash password with bcrypt
 */
function hash(password) {
  return bcrypt.hashSync(password, 10);
}

/**
 * Create a jwt token containing the user id that expires in 15 minutes
 */
function generateJwtToken(user) {
  return jwt.sign({ id: user.id }, config.secret, {
    expiresIn: '7d'
  });
}

/**
 * Get a random token of 40 bytes
 */
function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

// Send an Email with the verification token stored on Data Base in field verificationToken, this field is only stored when the user is not verified
async function sendVerificationEmail(user, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/auth/verify-email?token=${user.verificationToken}`;
    message = `<p>Haga clic en el enlace a continuación para verificar su dirección de correo electrónico:</p>
                 <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Utilice el siguiente token para verificar su dirección de correo electrónico con la ruta de la API <code>/user/verify-email</code>:</p>
                 <p><code>${user.verificationToken}</code></p>`;
  }

  await sendEmail({
    to: user.email,
    subject: 'Verificación email Scoring Robot',
    html: `<h4>Verificar Email</h4>
             <p>Gracias por registrarte</p>
             ${message}`
  });
}

/**
 * Send an email with token verify if user already registered
 */
async function sendAlreadyRegisteredEmail(email, origin) {
  let message;
  if (origin) {
    message = `<p>Si no recuerdas la contraseña o no has activado la cuenta ingresa a la página <a href="${origin}/user/forgot-password">Recuperar Contraseña</a>.</p>`;
  } else {
    message = `<p>Si no recuerdas la contraseña o no has activado la cuenta, puedes restaurarla mediante la ruta API <code>/user/forgot-password</code>.</p>`;
  }

  await sendEmail({
    to: email,
    subject: 'Scoring Robot - correo ya Registrado',
    html: `<h4>Email ya Registrado</h4>
               <p>Tu email <strong>${email}</strong> ya está registrado.</p>
               ${message}`
  });
}

/**
 * Send an email with a token to reset password when user forgot it
 */

async function sendPasswordResetEmail(user, origin) {
  console.log('sendPasswordResetEmail');

  let message;
  if (origin) {
    const resetUrl = `${origin}/auth/reset-password?token=${user.resetToken.token}`;
    message = `<p>Haga clic en el enlace de abajo para restablecer su contraseña, el enlace será válido por 1 día:</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Utilice el token a continuación para restablecer su contraseña con la ruta api <code>/user/reset-password</code> y el token: </p>
                 <p><code>${user.resetToken.token}</code></p>`;
  }

  await sendEmail({
    to: user.email,
    subject: 'Scoring Robot  - Restablecer Contraseña',
    html: message
  });
}
