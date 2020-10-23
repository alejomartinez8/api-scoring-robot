const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const teamsService = require('../services/teams.service');
const Role = require('../../helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

router.post('/', [authorize(), [check('name', 'Nombre es requerido').not().isEmpty(), check('event', 'Debes agregar un evento')]], addTeam);
router.post('/:id', [authorize(), [check('name', 'Nombre es requerido').not().isEmpty()]], updateTeam);
router.put('/register/:id', registerTeam);
router.get('/:id', authorize(), getById);
router.get('/', getTeams);
router.delete('/:id', authorize(), deleteTeam);
router.post('/addscore/:id', authorize([Role.Admin, Role.Judge]), addScore);
router.post('/updatescore/:id', authorize(Role.Admin), updateScore);
router.delete('/deletescore/:id', authorize(Role.Admin), deleteScore);

/** Add an Team */
function addTeam(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ errors: errors.array() });
  }

  // console.log(req.body);

  teamsService
    .addTeam(req.body)
    .then((team) => res.json(team))
    .catch(next);
}

/** Update an Team */
function updateTeam(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ errors: errors.array() });
  }

  teamsService
    .updateTeam(req.params.id, req.body)
    .then((team) => res.json(team))
    .catch(next);
}

/** Register/Activate a Team */
function registerTeam(req, res, next) {
  teamsService
    .registerTeam(req.params.id)
    .then((team) => res.json(team))
    .catch(next);
}

/** Get Team by Id */
function getById(req, res, next) {
  teamsService
    .getTeamById(req.params.id)
    .then((team) => res.json(team))
    .catch(next);
}

/** Get Teams */
function getTeams(req, res, next) {
  teamsService
    .getTeams(req.query)
    .then((teams) => {
      res.json(teams);
    })
    .catch(next);
}

/** Delete Team */
function deleteTeam(req, res, next) {
  teamsService
    .deleteTeam(req.params.id)
    .then(() => res.json({ message: 'Equipo Eliminado' }))
    .catch(next);
}

/******** Scores **********/
/** Add a Turn of a Team */
function addScore(req, res, next) {
  teamsService
    .addScore(req.params.id, req.body)
    .then((team) => res.json(team))
    .catch(next);
}

/** Update a Score for a Team */
function updateScore(req, res, next) {
  teamsService
    .updateScore(req.params.id, req.body)
    .then(() => res.json({ message: 'Score actualizado' }))
    .catch(next);
}

/** Delete Score */
function deleteScore(req, res, next) {
  teamsService
    .deleteScore(req.params.id)
    .then(() => res.json({ message: 'Score eliminado' }))
    .catch(next);
}
