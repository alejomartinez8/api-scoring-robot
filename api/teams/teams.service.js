const db = require('../../helpers/db');

module.exports = {
  addTeam,
  updateTeam,
  registerTeam,
  getTeams,
  getTeamById,
  deleteTeam
};

/** Add an Team */
async function addTeam(params) {
  // validate
  if (await db.Team.findOne({ name: params.name })) {
    throw `Equipo "${params.name}" ya está registrado`;
  }

  const team = new db.Team(params);
  await team.save();
  return team;
}

/** Update an Team */
async function updateTeam(id, params) {
  if (!db.isValidId(id)) throw 'Id de equipo no válido';
  const team = await db.Team.findById(id);
  if (!team) {
    throw 'Equipo no encontrado';
  }

  if (team.name !== params.name && (await db.Team.findOne({ name: params.name }))) {
    throw `Equipo "${params.name}" ya existe`;
  }

  if (params.turns) {
    const { tasks, penalties, taskPoints, bonusPoints, totalPoints } = params.turns;
    const newTurn = { tasks, penalties, taskPoints, bonusPoints, totalPoints };
    team.turns.unshift(newTurn);
  } else {
    Object.assign(team, params);
  }

  team.updated = Date.now();
  await team.save();

  return team;
}

/** Register Team */
async function registerTeam(id) {
  if (!db.isValidId(id)) {
    throw 'Id de equipo no válido';
  }

  const team = await db.Team.findById(id);
  if (!team) {
    throw 'Equipo no encontrado';
  }
  team.registered = !team.registered;
  team.save();
  return team;
}

/** Get Teams */
async function getTeams(query) {
  const teams = await db.Team.find(query)
    .populate('user')
    .populate({ path: 'event' })
    .populate({ path: 'challenge' })
    .exec();
  return teams.map((team) => team);
}

/** Get Team by Id */
async function getTeamById(id) {
  if (!db.isValidId(id)) throw 'Id de equipo no válido';
  const team = await db.Team.findById(id);
  if (!team) throw 'Equipo no encontrado';
  return team;
}

/**Delete Team by Id */
async function deleteTeam(id) {
  if (!db.isValidId(id)) throw 'Id de equipo no válido';
  const team = await db.Team.findById(id);
  if (!team) throw 'Equipo no encontrado';
  await team.remove();
}

/** Scores */
