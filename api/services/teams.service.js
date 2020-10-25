const db = require('../../helpers/db');

module.exports = {
  addTeam,
  updateTeam,
  registerTeam,
  getTeams,
  getTeamById,
  deleteTeam,
  addScore,
  updateScore,
  deleteScore
};

/** Add an Team */
async function addTeam(params) {
  try {
    if (await db.Team.findOne({ name: params.name })) {
      throw `Equipo "${params.name}" ya está registrado`;
    }

    const event = await db.Event.findOne({ _id: params.event });
    if (!event) {
      throw `Error al registrar equipo, no existe el evento relacionado`;
    }

    const challenge = await db.Challenge.findOne({ _id: params.challenge });
    if (!challenge) {
      throw `Error al registrar equipo, no existe el challenge relacionado`;
    }

    const team = new db.Team(params);
    await team.save();
    return team;
  } catch (error) {
    throw error;
  }
}

/** Update an Team */
async function updateTeam(id, params) {
  try {
    if (!db.isValidId(id)) {
      throw 'Id de equipo no válido';
    }

    const team = await db.Team.findById(id);
    if (!team) {
      throw 'Equipo no encontrado';
    }

    if (await db.Team.findOne({ name: params.name })) {
      throw `Equipo "${params.name}" ya existe`;
    }

    Object.assign(team, params);
    team.updated = Date.now();
    await team.save();
    return team;
  } catch (error) {
    throw error;
  }
}

/** Register Team */
async function registerTeam(id) {
  try {
    if (!db.isValidId(id)) {
      throw 'Id de equipo no válido';
    }

    const team = await db.Team.findById(id);
    if (!team) {
      throw 'Equipo no encontrado';
    }

    team.registered = !team.registered;
    team.updated = Date.now();
    team.save();
    return team;
  } catch (error) {
    throw error;
  }
}

/** Get Teams */
async function getTeams(query) {
  try {
    const teams = await db.Team.find(query).populate('challenge').populate('event').exec();
    return teams;
  } catch (error) {
    throw error;
  }
}

/** Get Team by Id */
async function getTeamById(id) {
  try {
    if (!db.isValidId(id)) throw 'Id de equipo no válido';
    const team = await db.Team.findById(id);
    if (!team) throw 'Equipo no encontrado';
    return team;
  } catch (error) {
    throw error;
  }
}

/****************Delete Team by Id **************/
async function deleteTeam(id) {
  try {
    if (!db.isValidId(id)) {
      throw 'Id no válido';
    }

    const team = await db.Team.findOneAndDelete({ _id: id });
    if (!team) {
      throw 'Equipo no encontrado';
    }

    return {
      type: 'delete-success',
      message: 'Equipo Eliminado Exitosamente',
      team: team
    };
  } catch (error) {
    throw error;
  }
}

/** Scores */

/** Add or Update a Turn of a Team */
async function addScore(id, params) {
  try {
    if (!db.isValidId(id)) {
      throw 'Id de equipo no válido';
    }

    const team = await db.Team.findById(id);
    if (!team) {
      throw 'Equipo no encontrado';
    }

    team.turns.push(params);
    team.updated = Date.now();
    team.save();
    return team;
  } catch (error) {
    throw error;
  }
}

/** Update turn/score of a Team */
async function updateScore(scoreId, params) {
  try {
    if (!db.isValidId(scoreId)) {
      throw 'Id no válido';
    }

    const team = await db.Team.findOne({ 'turns._id': scoreId });
    if (!team) {
      throw 'Score no encontrado';
    }

    const idx = team.turns.findIndex((elm) => elm._id == scoreId);
    if (idx !== -1) {
      team.turns[idx] = params;
      team.save();
      return team.turns[idx];
    }
  } catch (error) {
    throw error;
  }
}

/** Delete turn/score of a Team */
async function deleteScore(scoreId) {
  try {
    if (!db.isValidId(scoreId)) {
      throw 'Id no válido';
    }

    const team = await db.Team.findOne({ 'turns._id': scoreId });
    if (!team) {
      throw 'Score no encontrado';
    }

    team.turns.pull(scoreId);
    team.save();
  } catch (error) {
    throw error;
  }
}
