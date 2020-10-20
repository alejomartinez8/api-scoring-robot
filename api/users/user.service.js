const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

//Get All users
async function getAll() {
  const users = await db.User.find();
  return users.map((user) => user);
}

/**
 * Get user with id
 */
async function getById(id) {
  const user = await getUser(id);
  return user;
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

  return user;
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

  return user;
}

/**
 * Delete User
 */
async function _delete(id) {
  if (!db.isValidId(id)) throw 'User not found';
  const teams = await db.Team.find({ user: id });

  if (teams.length > 0) {
    return { type: 'reference', message: 'No es posible realizar esta operación, hay que equipos asociados a este usuario' };
  }

  const user = await getUser(id);
  if (user.role === 'Admin') {
    const users = await db.User.find({ role: 'Admin' });
    if (users.length === 1) {
      return {
        type: 'admin-only',
        message:
          'No es posible eliminar el único usuario Admin de este sitio, cree otro usuario con perfil de Admin, para eliminar este usuario'
      };
    }
  }

  await user.remove();
  return { type: 'delete-success', message: 'User eliminado satisfactoriamente' };
}

/**
 * get User with id
 */
async function getUser(id) {
  if (!db.isValidId(id)) throw 'User not found';
  const user = await db.User.findById(id).select('-passwordHash');
  if (!user) throw 'User not found';
  return user;
}

/**
 * Hash password with bcrypt
 */
function hash(password) {
  return bcrypt.hashSync(password, 10);
}
