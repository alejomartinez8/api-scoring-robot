const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('helpers/send-email');
const db = require('helpers/db');
const Role = require('helpers/role');

module.exports = {
  // Authenticate
  authenticate,
  refreshToken,
  revokeToken,

  // Register, verify email, forgot password
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,

  // Get accounts, one, create, update, delete
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

/**
 * Authenticate Service
 */
async function authenticate({ email, password, ipAddress }) {
  const account = await db.Account.findOne({ email });
  // console.log(account);

  if (!account || !account.isVerified || !bcrypt.compareSync(password, account.passwordHash)) {
    throw 'Email or password is incorrect';
  }

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(account);
  const refreshToken = generateRefreshToken(account, ipAddress);

  // save refresh token
  await refreshToken.save();

  // return basic details and tokens
  return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: refreshToken.token
  };
}

/**
 * Refresh Token Service
 */
async function refreshToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);
  const { account } = refreshToken;

  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(account, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(account);

  // return basic details and tokens
  return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: newRefreshToken.token
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

/**
 * Register an user to create an account
 */
async function register(params, origin) {
  // validate
  if (await db.Account.findOne({ email: params.email })) {
    // send already registered error in email to prevent account enumeration
    // console.log('Email registered');
    return await sendAlreadyRegisteredEmail(params.email, origin);
  }

  // create account object
  const account = new db.Account(params);

  // first registered account is an admin
  const isFirstAccount = (await db.Account.countDocuments({})) === 0;
  account.role = isFirstAccount ? Role.Admin : Role.User;
  account.verificationToken = randomTokenString();

  // hash password
  account.passwordHash = hash(params.password);

  // save account
  await account.save();

  // send email
  await sendVerificationEmail(account, origin);
}

/**
 * With the token sent to email, verify the user to access to the API
 */
async function verifyEmail({ token }) {
  const account = await db.Account.findOne({ verificationToken: token });

  if (!account) throw 'Verification failed';

  account.verified = Date.now();
  account.verificationToken = undefined; //Delete Verification Token but and verified field with Date in DB
  await account.save();
}

/**
 * Find email on DB if exist, if yes send and email with reset Token
 */
async function forgotPassword({ email }, origin) {
  const account = await db.Account.findOne({ email });

  // always return ok response to prevent email enumeration
  if (!account) throw 'Email incorrect'; //return;

  // create reset token that expires after 24 hours
  account.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
  await account.save();

  // send email
  await sendPasswordResetEmail(account, origin);
}

/**
 * Find on DB the token in 'resetToken' field
 */
async function validateResetToken({ token }) {
  const account = await db.Account.findOne({
    'resetToken.token': token,
    'resetToken.expires': { $gt: Date.now() }
  });

  if (!account) throw 'Invalid token';
}

//
//
async function resetPassword({ token, password }) {
  const account = await db.Account.findOne({
    'resetToken.token': token,
    'resetToken.expires': { $gt: Date.now() }
  });

  if (!account) throw 'Invalid token';

  // update password and remove reset token
  account.passwordHash = hash(password);
  account.passwordReset = Date.now();
  account.resetToken = undefined;
  await account.save();
}

/**
 * Get All accounts
 */
async function getAll() {
  const accounts = await db.Account.find();
  return accounts.map((account) => basicDetails(account));
}

/**
 * Get account with id
 */
async function getById(id) {
  const account = await getAccount(id);
  return basicDetails(account);
}

/**
 * Create an account
 */
async function create(params) {
  // validate
  if (await db.Account.findOne({ email: params.email })) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const account = new db.Account(params);
  account.verified = Date.now();

  // hash password
  account.passwordHash = hash(params.password);

  // save account
  await account.save();

  return basicDetails(account);
}

/**
 * Update account by id
 */
async function update(id, params) {
  const account = await getAccount(id);

  // validate
  if (account.email !== params.email && (await db.Account.findOne({ email: params.email }))) {
    throw 'Email "' + params.email + '" is already taken';
  }

  // hash password if it was entered
  if (params.password) {
    params.passwordHash = hash(params.password);
  }

  // copy params to account and save
  Object.assign(account, params);
  account.updated = Date.now();
  await account.save();

  return basicDetails(account);
}

/**
 * Delete Account
 */
async function _delete(id) {
  const account = await getAccount(id);
  await account.remove();
}

/**
 * get Account with id
 */
async function getAccount(id) {
  if (!db.isValidId(id)) throw 'Account not found';
  const account = await db.Account.findById(id);
  if (!account) throw 'Account not found';
  return account;
}

/**
 * Find token in RefreshToken DB
 */
async function getRefreshToken(token) {
  const refreshToken = await db.RefreshToken.findOne({ token }).populate('account');
  if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
  return refreshToken;
}

/**
 * Hash password with bcrypt
 */
function hash(password) {
  return bcrypt.hashSync(password, 10);
}

/**
 * Create a jwt token containing the account id that expires in 15 minutes
 */
function generateJwtToken(account) {
  return jwt.sign({ sub: account.id, id: account.id }, config.secret, {
    expiresIn: '15m'
  });
}

/**
 * Create a refresh token that expires in 7 days
 */
function generateRefreshToken(account, ipAddress) {
  return new db.RefreshToken({
    account: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress
  });
}

/**
 * Get a random token of 40 bytes
 */
function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Return Basic Details of Account (filter by BD)
 */
function basicDetails(account) {
  const { id, title, firstName, lastName, email, role, created, updated, isVerified } = account;
  return {
    id,
    title,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isVerified
  };
}

/**
 * Send an Email with the verification token stored on Data Base in field verificationToken, this field is only stored when the user is not verified
 */
async function sendVerificationEmail(account, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
    message = `<p>Please click the below link to verify your email address:</p>
                 <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                 <p><code>${account.verificationToken}</code></p>`;
  }

  await sendEmail({
    to: account.email,
    subject: 'Sign-up Verification API - Verify Email',
    html: `<h4>Verify Email</h4>
             <p>Thanks for registering!</p>
             ${message}`
  });
}

/**
 * Send an Email for an user already registered whit the link of forgot password
 */
async function sendAlreadyRegisteredEmail(email, origin) {
  let message;
  if (origin) {
    message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
  } else {
    message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
  }

  await sendEmail({
    to: email,
    subject: 'Sign-up Verification API - Email Already Registered',
    html: `<h4>Email Already Registered</h4>
             <p>Your email <strong>${email}</strong> is already registered.</p>
             ${message}`
  });
}

/**
 * Send an email with a token to reset password when user forgot it
 */

async function sendPasswordResetEmail(account, origin) {
  let message;
  if (origin) {
    const resetUrl = `${origin}/account/reset-password?token=${account.resetToken.token}`;
    message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                 <p><code>${account.resetToken.token}</code></p>`;
  }

  await sendEmail({
    to: account.email,
    subject: 'Competencias Robótica Pygmalion - Reset Password',
    html: `<h4>Reset Password Email</h4>
             ${message}`
  });
}
