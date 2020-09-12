const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('helpers/send-email');
const db = require('helpers/db');
const Role = require('../../helpers/role');

module.exports = {
  // loing, register, verify email, forgot password
  login,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,

  // Get users, one, create, update, delete
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

/**
 * login Service
 */
async function login({ email, password }) {
  console.log('login service');
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
  return {
    // ...basicDetails(user),
    token
  };
}

/**
 * Register an user to create an user
 */
async function register(params, origin) {
  console.log('register service');
  if (await db.User.findOne({ email: params.email })) {
    throw 'Email ya registrado';
    // send already registered error in email to prevent user enumeration
    // return await sendAlreadyRegisteredEmail(params.email, origin);
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
  if (!user) return;

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

//Get All users
async function getAll() {
  const users = await db.User.find();
  return users.map((user) => basicDetails(user));
}

/**
 * Get user with id
 */
async function getById(id) {
  const user = await getUser(id);
  return basicDetails(user);
}

/**
 * Create an user
 */
async function create(params) {
  // validate
  if (await db.User.findOne({ email: params.email })) {
    throw 'Email "' + params.email + '" ya está registrado';
  }

  const user = new db.User(params);
  user.verified = Date.now();

  // hash password
  user.passwordHash = hash(params.password);

  // save user
  await user.save();

  return basicDetails(user);
}

/**
 * Update user by id
 */
async function update(id, params) {
  const user = await getUser(id);

  // validate
  if (user.email !== params.email && (await db.User.findOne({ email: params.email }))) {
    throw 'Email "' + params.email + '" is already taken';
  }

  // hash password if it was entered
  if (params.password) {
    params.passwordHash = hash(params.password);
  }

  // copy params to user and save
  Object.assign(user, params);
  user.updated = Date.now();
  await user.save();

  return basicDetails(user);
}

/**
 * Delete User
 */
async function _delete(id) {
  const user = await getUser(id);
  await user.remove();
}

/**
 * get User with id
 */
async function getUser(id) {
  if (!db.isValidId(id)) throw 'User not found';
  const user = await db.User.findById(id);
  if (!user) throw 'User not found';
  return user;
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
    expiresIn: '1d'
  });
}

/**
 * Get a random token of 40 bytes
 */
function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Return Basic Details of User (filter by BD)
 */
function basicDetails(user) {
  //values
  const {
    id,
    title,
    firstName,
    lastName,
    email,
    role,
    institution,
    city,
    country,
    bio,
    created,
    updated,
    isVerified
  } = user;

  // return
  return {
    id,
    title,
    firstName,
    lastName,
    email,
    role,
    institution,
    city,
    country,
    bio,
    created,
    updated,
    isVerified
  };
}

// Send an Email with the verification token stored on Data Base in field verificationToken, this field is only stored when the user is not verified
async function sendVerificationEmail(user, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/user/verify-email?token=${user.verificationToken}`;
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
 * Send an email with a token to reset password when user forgot it
 */

async function sendPasswordResetEmail(user, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/user/reset-password?token=${user.resetToken.token}`;
    message = `<p>Haga clic en el enlace de abajo para restablecer su contraseña, el enlace será válido por 1 día:</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Utilice el token a continuación para restablecer su contraseña con la ruta api <code>/user/reset-password</code> y el token: </p>
                 <p><code>${user.resetToken.token}</code></p>`;
  }

  await sendEmail({
    to: user.email,
    subject: 'Scoring Robot Pygmalion - Restablecer',
    html: `<h4>Reset Password Email</h4>
             ${message}`
  });
}