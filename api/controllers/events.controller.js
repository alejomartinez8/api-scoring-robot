const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const eventsService = require('../services/events.service');
const Role = require('../../helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

router.post(
  '/',
  [authorize(Role.Admin), [check('name', 'Nombre es requerido').not().isEmpty(), check('slug', 'Slug es requerido').not().isEmpty()]],
  addEvent
);
router.post(
  '/:id',
  [authorize(Role.Admin), [check('name', 'Nombre es requerido').not().isEmpty(), check('slug', 'Slug es requerido').not().isEmpty()]],
  updateEvent
);
router.get('/:id', authorize(Role.Admin), getById);
router.get('/slug/:slug', getBySlug);
router.get('/', getAll);
router.put('/active/:id', toggleActiveEvent);
router.delete('/:id', authorize(Role.Admin), deleteEvent);

/** Add an Event */
function addEvent(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ errors: errors.array() });
  }
  eventsService
    .addEvent(req.body)
    .then((event) => res.json(event))
    .catch(next);
}

/** Update an Event */
function updateEvent(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ errors: errors.array() });
  }

  eventsService
    .updateEvent(req.params.id, req.body)
    .then((event) => res.json(event))
    .catch(next);
}

/** Get Event by Id */
function getById(req, res, next) {
  eventsService
    .getById(req.params.id)
    .then((event) => res.json(event))
    .catch(next);
}

/** Get Event by slug */
function getBySlug(req, res, next) {
  eventsService
    .getBySlug(req.params.slug)
    .then((event) => res.json(event))
    .catch(next);
}

/** Get Events by Slug, get all Events */
function getAll(req, res, next) {
  eventsService
    .getAllEvents()
    .then((events) => {
      res.json(events);
    })
    .catch(next);
}

/** Delete Event */
function deleteEvent(req, res, next) {
  eventsService
    .deleteEvent(req.params.id)
    .then((response) => res.json(response))
    .catch(next);
}

/** Activate an Event */
function toggleActiveEvent(req, res, next) {
  eventsService
    .toggleActiveEvent(req.params.id)
    .then((status) => res.json(status))
    .catch(next);
}
