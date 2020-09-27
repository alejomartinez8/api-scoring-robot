const db = require('../../helpers/db');

module.exports = {
  sendScore,
  getAllScores,
  getById,
  deleteScore
};

/** Send an Score */
async function sendScore(params) {
  let score = await db.Score.findOne({
    team: params.team,
    event: params.event,
    challenge: params.challenge
  });

  if (!score) {
    score = new db.Score(params);
  }

  const { tasks, penalties, taskPoints, bonusPoints, totalPoints } = params;
  const newTurn = { tasks, penalties, taskPoints, bonusPoints, totalPoints };
  score.turns.unshift(newTurn);

  await score.save();
  return score;
}

/** Get All Scores */
async function getAllScores() {
  const events = await db.Score.find();
  return events.map((score) => score);
}

/** Get Score by Id */
async function getById(id) {
  if (!db.isValidId(id)) throw 'Id de reto no válido';
  const score = await db.Score.findById(id);
  if (!score) throw 'Reto no encontrado';
  return score;
}

/**Delete Score by Id */
async function deleteScore(id) {
  if (!db.isValidId(id)) throw 'Id de reto no válido';
  const score = await db.Score.findById(id);
  if (!score) throw 'Reto no encontrado';
  await score.remove();
}
