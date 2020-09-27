const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const scoresService = require('./scores.service');
const Role = require('../../helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

/** Send an Score */
router.post(
  '/',
  [authorize([Role.Admin, Role.Judge]), [check('team', 'Equipo es requerido').not().isEmpty()]],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array() });
    }

    scoresService
      .sendScore(req.body)
      .then((score) => res.json(score))
      .catch(next);
  }
);

/** Get Score by Id */
router.get('/:id', authorize(), (req, res, next) => {
  scoresService
    .getById(req.params.id)
    .then((score) => res.json(score))
    .catch(next);
});

/** Get all Scores */
router.get('/', authorize(), (req, res, next) => {
  scoresService
    .getAllScores()
    .then((scores) => {
      res.json(scores);
    })
    .catch(next);
});

/** Delete Score */
router.delete('/:id', authorize(Role.Admin), (req, res, next) => {
  scoresService
    .deleteScore(req.params.id)
    .then(() => res.json({ message: 'Reto Eliminado' }))
    .catch(next);
});
