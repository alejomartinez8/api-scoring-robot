const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const teamsService = require('./teams.service');
const Role = require('../../helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

/** Add an Team */
router.post(
  '/',
  [authorize(), [check('name', 'Nombre es requerido').not().isEmpty()], [check('event', 'Debes agregar un evento')]],
  (req, res, next) => {
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
);

/** Update an Team */
router.post('/:id', [authorize(), [check('name', 'Nombre es requerido').not().isEmpty()]], (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next({ errors: errors.array() });
  }

  teamsService
    .updateTeam(req.params.id, req.body)
    .then((team) => res.json(team))
    .catch(next);
});

/** Register/Activate a Team */
router.put('/register/:id', (req, res, next) => {
  teamsService
    .registerTeam(req.params.id)
    .then((team) => res.json(team))
    .catch(next);
});

/** Get Team by Id */
router.get('/:id', authorize(), (req, res, next) => {
  teamsService
    .getTeamById(req.params.id)
    .then((team) => res.json(team))
    .catch(next);
});

/** Get Teams */
router.get('/', (req, res, next) => {
  teamsService
    .getTeams(req.query)
    .then((teams) => {
      res.json(teams);
    })
    .catch(next);
});

/** Delete Team */
router.delete('/:id', authorize(), (req, res, next) => {
  teamsService
    .deleteTeam(req.params.id)
    .then(() => res.json({ message: 'Equipo Eliminado' }))
    .catch(next);
});

/******** Scores **********/
/** Add a Turn of a Team */
router.post('/addscore/:id', authorize(['Admin', 'Judge']), (req, res, next) => {
  teamsService
    .addScore(req.params.id, req.body)
    .then((team) => res.json(team))
    .catch(next);
});

/** Update a Score for a Team */
router.post('/updatescore/:id', authorize('Admin'), (req, res, next) => {
  teamsService
    .updateScore(req.params.id, req.body)
    .then(() => res.json({ message: 'Score actualizado' }))
    .catch(next);
});

/** Delete Score */
router.delete('/deletescore/:id', authorize('Admin'), (req, res, next) => {
  teamsService
    .deleteScore(req.params.id)
    .then(() => res.json({ message: 'Score eliminado' }))
    .catch(next);
});
