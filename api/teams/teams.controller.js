const express = require('express');
const router = express.Router();
const authorize = require('middleware/authorize');
const teamsService = require('./teams.service');
const Role = require('helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

/** Add an Team */
router.post(
  '/',
  [authorize(), [check('name', 'Nombre es requerido').not().isEmpty()]],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array() });
    }

    teamsService
      .addTeam(req.body)
      .then((team) => res.json(team))
      .catch(next);
  }
);

/** Update an Team */
router.post(
  '/:id',
  [authorize(), [check('name', 'Nombre es requerido').not().isEmpty()]],
  (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array() });
    }

    teamsService
      .updateTeam(req.params.id, req.body)
      .then((team) => res.json(team))
      .catch(next);
  }
);

/** Get Team by Id */
router.get('/:id', authorize(), (req, res, next) => {
  teamsService
    .getTeamById(req.params.id)
    .then((team) => res.json(team))
    .catch(next);
});

/** Get All Teams */
router.get('/', (req, res, next) => {
  teamsService
    .getAllTeams()
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