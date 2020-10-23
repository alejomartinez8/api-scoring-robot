const config = require('../../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../../helpers/send-email');
const db = require('../../helpers/db');
const Role = require('../../helpers/role');

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
  try {
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

    const token = generateJwtToken(user);
    return { token };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/** Google Auth Token */
async function authGoogleToken(user) {
  try {
    if (!user) {
      throw 'Usuario Google no encontrado';
    }
    const token = generateJwtToken(user);
    return { token };
  } catch (error) {
    throw error;
  }
}

/** Facebook Auth Token */
async function authFacebookToken(user) {
  try {
    if (!user) {
      throw 'Usuario Facebook no encontrado';
    }

    const token = generateJwtToken(user);
    return { token };
  } catch (error) {
    throw error;
  }
}

/**
 * Register an user to create an user
 */
async function register(params, origin) {
  try {
    if (await db.User.findOne({ email: params.email })) {
      await sendAlreadyRegisteredEmail(params.email, origin);
      throw 'Email ya registrado, revisa tu correo electrónico para restablecer tu contraseña';
    }
    const user = new db.User(params);
    const isFirstUser = (await db.User.countDocuments({})) === 0;
    user.role = isFirstUser ? Role.Admin : Role.User;
    user.verificationToken = randomTokenString();
    user.passwordHash = hash(params.password);
    await user.save();
    await sendVerificationEmail(user, origin);
  } catch (error) {
    throw error;
  }
}

// With the token sent to email, verify the user to access to the API
async function verifyEmail({ token }) {
  try {
    const user = await db.User.findOne({ verificationToken: token });
    if (!user) throw 'Verification failed';
    user.verified = Date.now();
    user.verificationToken = undefined;
    await user.save();
  } catch (error) {
    throw error;
  }
}

// Find email on DB if exist, if yes send and email with reset Token
async function forgotPassword({ email }, origin) {
  try {
    const user = await db.User.findOne({ email });
    if (!user) {
      console.log('email not exists');
      return;
    }

    user.resetToken = {
      token: randomTokenString(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    await user.save();
    await sendPasswordResetEmail(user, origin);
  } catch (error) {
    throw error;
  }
}

// Find on DB the token in 'resetToken' field
async function validateResetToken({ token }) {
  try {
    const user = await db.User.findOne({
      'resetToken.token': token,
      'resetToken.expires': { $gt: Date.now() }
    });

    if (!user) throw 'Invalid token';
  } catch (error) {
    throw error;
  }
}

// reset Password
async function resetPassword({ token, password }) {
  try {
    const user = await db.User.findOne({
      'resetToken.token': token,
      'resetToken.expires': { $gt: Date.now() }
    });

    if (!user) throw 'Invalid token';

    // update password and delete reset token
    user.passwordHash = hash(password);
    user.passwordReset = Date.now();
    user.resetToken = undefined;
    await user.save();
  } catch (error) {
    throw error;
  }
}

async function testEmailConfig(email) {
  try {
    if (!email) {
      throw 'No hay dirección de correo electrónico';
    }

    return await sendEmail({
      to: email,
      subject: 'Correo de Prueba Scoring-Robot',
      html: '<p>Correo de Prueba desde Scoring-Robot App</p>'
    });
  } catch (error) {
    throw error;
  }
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
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verificación email Scoring Robot',
      html: `<h4>Verificar Email</h4>
             <p>Gracias por registrarte</p>
             ${message}`
    });
  } catch (error) {
    throw error;
  }
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

  try {
    await sendEmail({
      to: email,
      subject: 'Scoring Robot - correo ya Registrado',
      html: `<h4>Email ya Registrado</h4>
               <p>Tu email <strong>${email}</strong> ya está registrado.</p>
               ${message}`
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Send an email with a token to reset password when user forgot it
 */

async function sendPasswordResetEmail(user, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/auth/reset-password?token=${user.resetToken.token}`;
    message = `<p>Haga clic en el enlace de abajo para restablecer su contraseña, el enlace será válido por 1 día:</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Utilice el token a continuación para restablecer su contraseña con la ruta api <code>/user/reset-password</code> y el token: </p>
                 <p><code>${user.resetToken.token}</code></p>`;
  }

  try {
    await sendEmail({
      to: user.email,
      subject: 'Scoring Robot  - Restablecer Contraseña',
      html: message
    });
  } catch (error) {
    throw error;
  }
}
