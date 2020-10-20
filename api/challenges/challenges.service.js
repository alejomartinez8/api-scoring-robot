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
  // validate
  if (await db.Challenge.findOne({ slug: params.slug })) {
    throw `Slug "${params.version}" ya registrado`;
  }

  const challenge = new db.Challenge(params);
  await challenge.save();
  return challenge;
}

/** Update an Challenge */
async function updateChallenge(id, params) {
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
}

/** Get All Challenges */
async function getAllChallenges() {
  const events = await db.Challenge.find();
  return events.map((challenge) => challenge);
}

/** Get Challenge by Id */
async function getById(id) {
  if (!db.isValidId(id)) throw 'Id de reto no válido';
  const challenge = await db.Challenge.findById(id);
  if (!challenge) throw 'Reto no encontrado';
  return challenge;
}

/** Get Challenge by slug */
async function getBySlug(slug) {
  const event = await db.Challenge.findBySlug(slug);

  if (!event) throw 'Reto no encontrado';
  return event;
}

/**Delete Challenge by Id */
async function deleteChallenge(id) {
  if (!db.isValidId(id)) {
    throw 'Id de reto no válido';
  }

  const teams = await db.Team.find({ challenge: id });
  if (teams.length > 0) {
    return { type: 'reference', message: 'No es posible realizar esta operación, hay que equipos asociados a este reto' };
  } else {
    const challenge = await db.Challenge.findById(id);
    if (!challenge) throw 'Reto no encontrado';
    await challenge.remove();
    return { type: 'delete-success' };
  }
}
