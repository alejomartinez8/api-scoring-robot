const db = require('helpers/db');

module.exports = {
  addTeam,
  updateTeam,
  getAllTeams,
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
  return basicDetails(team);
}

/** Update an Team */
async function updateTeam(id, params) {
  if (!db.isValidId(id)) throw 'Id de equipo no válido';
  const team = await db.Team.findById(id);
  if (!team) throw 'Equipo no encontrado';

  if (team.name !== params.name && (await db.User.findOne({ name: params.name }))) {
    throw `Equipo "${params.name}" ya existe`;
  }

  Object.assign(team, params);
  team.updated = Date.now();
  await team.save();

  return basicDetails(team);
}

/** Get All Teams */
async function getAllTeams() {
  const teams = await db.Team.find();
  return teams.map((team) => basicDetails(team));
}

/** Get Team by Id */
async function getTeamById(id) {
  if (!db.isValidId(id)) throw 'Id de equipo no válido';
  const team = await db.Team.findById(id);
  if (!team) throw 'Equipo no encontrado';
  return basicDetails(team);
}

/**Delete Team by Id */
async function deleteTeam(id) {
  if (!db.isValidId(id)) throw 'Id de equipo no válido';
  const team = await db.Team.findById(id);
  if (!team) throw 'Equipo no encontrado';
  await team.remove();
}

/**
 * Return Basic Details
 */
function basicDetails(team) {
  //values
  const { id, coach, name, number, category, institution, players, created, updated } = team;

  // return
  return {
    id,
    coach,
    name,
    number,
    category,
    institution,
    players,
    created,
    updated
  };
}
