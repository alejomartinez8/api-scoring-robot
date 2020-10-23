const db = require("../../helpers/db");
const { param } = require("./teams.controller");

module.exports = {
  addTeam,
  updateTeam,
  registerTeam,
  getTeams,
  getTeamById,
  deleteTeam,
  addScore,
  updateScore,
  deleteScore,
};

/** Add an Team */
async function addTeam(params) {
  try {
    console.log(params);

    if (await db.Team.findOne({ name: params.name })) {
      throw `Equipo "${params.name}" ya está registrado`;
    }

    if (Object.keys(params.challenge).length === 0) {
      delete params.challenge;
    }

    const team = new db.Team(params);
    await team.save();
    return team;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/** Update an Team */
async function updateTeam(id, params) {
  if (!db.isValidId(id)) throw "Id de equipo no válido";
  const team = await db.Team.findById(id);
  if (!team) {
    throw "Equipo no encontrado";
  }

  if (
    team.name !== params.name &&
    (await db.Team.findOne({ name: params.name }))
  ) {
    throw `Equipo "${params.name}" ya existe`;
  }

  Object.assign(team, params);
  team.updated = Date.now();
  await team.save();

  return team;
}

/** Register Team */
async function registerTeam(id) {
  if (!db.isValidId(id)) {
    throw "Id de equipo no válido";
  }

  const team = await db.Team.findById(id);
  if (!team) {
    throw "Equipo no encontrado";
  }
  team.registered = !team.registered;
  team.updated = Date.now();
  team.save();
  return team;
}

/** Get Teams */
async function getTeams(query) {
  const teams = await db.Team.find(query)
    .populate("challenge")
    .populate("event")
    .exec();
  return teams;
}

/** Get Team by Id */
async function getTeamById(id) {
  if (!db.isValidId(id)) throw "Id de equipo no válido";
  const team = await db.Team.findById(id);
  if (!team) throw "Equipo no encontrado";
  return team;
}

/****************Delete Team by Id **************/
async function deleteTeam(id) {
  if (!db.isValidId(id)) {
    throw "Id no válido";
  }
  const team = await db.Team.findOneAndDelete({ _id: id });
  if (!team) throw "Equipo no encontrado";
  return {
    type: "delete-success",
    message: "Equipo Eliminado Exitosamente",
    team: team,
  };
}

/** Scores */

/** Add or Update a Turn of a Team */
async function addScore(id, params) {
  if (!db.isValidId(id)) {
    throw "Id de equipo no válido";
  }

  const team = await db.Team.findById(id);
  if (!team) {
    throw "Equipo no encontrado";
  }

  team.turns.push(params);
  team.updated = Date.now();
  team.save();

  return team;
}

/** Update turn/score of a Team */
async function updateScore(scoreId, params) {
  // console.log({ scoreId }, { params });
  if (!db.isValidId(scoreId)) {
    throw "Id no válido";
  }

  const team = await db.Team.findOne({ "turns._id": scoreId });
  if (!team) {
    throw "Score no encontrado";
  }

  const idx = team.turns.findIndex((elm) => elm._id == scoreId);
  if (idx !== -1) {
    team.turns[idx] = params;
    team.save();
    return team.turns[idx];
  }
}

/** Delete turn/score of a Team */
async function deleteScore(scoreId) {
  if (!db.isValidId(scoreId)) {
    throw "Id no válido";
  }

  const team = await db.Team.findOne({ "turns._id": scoreId });
  if (!team) {
    throw "Score no encontrado";
  }

  team.turns.pull(scoreId);
  team.save();
}
