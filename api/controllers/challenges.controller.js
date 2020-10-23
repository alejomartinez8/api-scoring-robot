const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const challengesService = require('../services/challenges.service');
const Role = require('../../helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

router.post(
  '/',
  [authorize(Role.Admin), [check('name', 'Nombre es requerido').not().isEmpty(), check('slug', 'Slug requerido').not().isEmpty()]],
  addChallenge
);
router.post(
  '/:id',
  [authorize(Role.Admin), [check('name', 'Nombre es requerido').not().isEmpty(), check('slug', 'Slug requerido').not().isEmpty()]],
  updateChallenge
);
router.get('/:id', authorize(), getById);
router.get('/', getAll);
router.delete('/:id', authorize(Role.Admin), deleteChallenge);

function validateChallenge() {
  return [check('name', 'Nombre es requerido').not().isEmpty(), check('slug', 'Slug requerido').not().isEmpty()];
}

/** Add an Challenge */
function addChallenge(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ errors: errors.array() });
  }

  challengesService
    .addChallenge(req.body)
    .then((challenge) => res.json(challenge))
    .catch(next);
}

/** Update an Challenge */
function updateChallenge(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ errors: errors.array() });
  }

  challengesService
    .updateChallenge(req.params.id, req.body)
    .then((challenge) => res.json(challenge))
    .catch(next);
}

/** Get Challenge by Id */
function getById(req, res, next) {
  challengesService
    .getById(req.params.id)
    .then((challenge) => res.json(challenge))
    .catch(next);
}

/** Get Challenges by Slug, get all Challenges */
function getAll(req, res, next) {
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
}

/** Delete Challenge */
function deleteChallenge(req, res, next) {
  challengesService
    .deleteChallenge(req.params.id)
    .then((response) => res.json(response))
    .catch(next);
}
