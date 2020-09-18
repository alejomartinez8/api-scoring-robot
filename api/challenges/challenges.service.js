const db = require('helpers/db');

module.exports = {
  addChallenge,
  updateChallenge,
  getAllChallenges,
  getById,
  deleteChallenge
};

/** Add an Challenge */
async function addChallenge(params) {
  // validate
  if (await db.Challenge.findOne({ version: params.version })) {
    throw `Código de reto "${params.version}" ya registrado`;
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

  if (
    challenge.version !== params.version &&
    (await db.User.findOne({ version: params.version }))
  ) {
    throw `Código de reto "${params.name}" ya registrado`;
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

/**Delete Challenge by Id */
async function deleteChallenge(id) {
  if (!db.isValidId(id)) throw 'Id de reto no válido';
  const challenge = await db.Challenge.findById(id);
  if (!challenge) throw 'Reto no encontrado';
  await challenge.remove();
}