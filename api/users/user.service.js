const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');

module.exports = {
  getAll,
  getById,
  addUser,
  updateUser,
  deleteUser
};

//Get All users
async function getAll() {
  try {
    const users = await db.User.find();
    return users.map((user) => user);
  } catch (error) {
    throw error;
  }
}

/** Get user by id */
async function getById(id) {
  try {
    const user = await getUser(id);
    return user;
  } catch (error) {
    throw error;
  }
}

/** Create an user **/
async function addUser(params) {
  try {
    if (await db.User.findOne({ email: params.email })) {
      throw 'Email "' + params.email + '" ya está registrado';
    }

    const user = new db.User(params);
    user.verified = Date.now();

    // hash password
    user.passwordHash = bcrypt.hashSync(params.password, 10);

    // save user
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
}

/** Update user by id **/
async function updateUser(id, params) {
  try {
    const user = await getUser(id);
    if (user.email !== params.email && (await db.User.findOne({ email: params.email }))) {
      throw 'Email "' + params.email + '" is already taken';
    }

    if (params.password) {
      params.passwordHash = bcrypt.hashSync(params.password, 10);
    }

    Object.assign(user, params);
    user.updated = Date.now();
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
}

/** Delete User **/
async function deleteUser(id) {
  try {
    if (!db.isValidId(id)) {
      throw 'User not found';
    }

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

    const res = await user.deleteOne();
    if (!res) {
      throw { type: 'error', message: 'Error al borrar usuario' };
    } else {
      return { type: 'delete-success', message: 'User eliminado satisfactoriamente', user: res };
    }
  } catch (error) {
    throw error;
  }
}

/** get User with id **/
async function getUser(id) {
  try {
    if (!db.isValidId(id)) {
      throw 'User not found';
    }
    const user = await db.User.findById(id).select('-passwordHash');
    if (!user) throw 'User not found';
    return user;
  } catch (error) {
    throw error;
  }
}
