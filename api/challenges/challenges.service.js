const db = require('../../helpers/db');

module.exports = {
  addChallenge,
  updateChallenge,
  getAllChallenges,
  getById,
  getBySlug,
  deleteChallenge
};

/** Add an Challenge */
async function addChallenge(params) {
  try {
    if (await db.Challenge.findOne({ name: params.name })) {
      throw `Nombre "${params.name}" ya está registrado`;
    }

    if (await db.Challenge.findOne({ slug: params.slug })) {
      throw `Slug "${params.version}" ya registrado`;
    }

    const challenge = new db.Challenge(params);
    await challenge.save();
    return challenge;
  } catch (error) {
    throw error;
  }
}

/** Update an Challenge */
async function updateChallenge(id, params) {
  try {
    if (!db.isValidId(id)) throw 'Id de reto no válido';
    const challenge = await db.Challenge.findById(id);
    if (!challenge) throw 'Reto no encontrado';

    if (challenge.slug !== params.slug && (await db.Challenge.findOne({ slug: params.slug }))) {
      throw `Slug "${params.name}" ya registrado`;
    }

    Object.assign(challenge, params);
    challenge.updated = Date.now();
    await challenge.save();

    return challenge;
  } catch (error) {
    return error;
  }
}

/** Get All Challenges */
async function getAllChallenges() {
  try {
    const challenges = await db.Challenge.find();
    return challenges;
  } catch (error) {
    return error;
  }
}

/** Get Challenge by Id */
async function getById(id) {
  try {
    if (!db.isValidId(id)) {
      throw 'Id de reto no válido';
    }

    const challenge = await db.Challenge.findById(id);
    if (!challenge) {
      throw 'Reto no encontrado';
    } else {
      return challenge;
    }
  } catch (error) {
    return error;
  }
}

/** Get Challenge by slug */
async function getBySlug(slug) {
  try {
    const challengeBySlug = await db.Challenge.findBySlug(slug);
    if (!challengeBySlug) {
      throw 'Reto no encontrado';
    } else {
      return challengeBySlug;
    }
  } catch (error) {
    throw error;
  }
}

/**Delete Challenge by Id */
async function deleteChallenge(id) {
  try {
    if (!db.isValidId(id)) {
      throw 'Id de reto no válido';
    }

    const teams = await db.Team.find({ challenge: id });
    if (teams.length > 0) {
      return { type: 'reference', message: 'No es posible realizar esta operación, hay que equipos asociados a este reto' };
    } else {
      const challenge = await db.Challenge.findByIdAndDelete({ _id: id });
      if (!challenge) throw 'Reto no encontrado';
      return { type: 'delete-success', message: 'Reto Eliminado Exitosamente', challenge: challenge };
    }
  } catch (error) {
    throw error;
  }
}
