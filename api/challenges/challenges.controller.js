const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const challengesService = require('./challenges.service');
const Role = require('../../helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

/** Add an Challenge */
router.post(
  '/',
  [
    authorize(Role.Admin),
    [
      check('name', 'Nombre es requerido').not().isEmpty(),
      check('slug', 'Slug requerido').not().isEmpty()
    ]
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array() });
    }

    challengesService
      .addChallenge(req.body)
      .then((challenge) => res.json(challenge))
      .catch(next);
  }
);

/** Update an Challenge */
router.post(
  '/:id',
  [
    authorize(Role.Admin),
    [
      check('name', 'Nombre es requerido').not().isEmpty(),
      check('slug', 'Slug requerido').not().isEmpty()
    ]
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array() });
    }

    challengesService
      .updateChallenge(req.params.id, req.body)
      .then((challenge) => res.json(challenge))
      .catch(next);
  }
);

/** Get Challenge by Id */
router.get('/:id', authorize(), (req, res, next) => {
  challengesService
    .getById(req.params.id)
    .then((challenge) => res.json(challenge))
    .catch(next);
});

/** Get Challenges by Slug, get all Challenges */
router.get('/', authorize(), (req, res, next) => {
  if (req.query.slug) {
    challengesService
      .getBySlug(req.query.slug)
      .then((challenge) => res.json(challenge))
      .catch(next);
  } else {
    challengesService
      .getAllChallenges()
      .then((challenges) => {
        res.json(challenges);
      })
      .catch(next);
  }
});

/** Delete Challenge */
router.delete('/:id', authorize(Role.Admin), (req, res, next) => {
  challengesService
    .deleteChallenge(req.params.id)
    .then(() => res.json({ message: 'Reto Eliminado' }))
    .catch(next);
});
