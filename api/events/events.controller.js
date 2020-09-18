const express = require('express');
const router = express.Router();
const authorize = require('middleware/authorize');
const eventsService = require('./events.service');
const Role = require('helpers/role');
const { check, validationResult } = require('express-validator');

module.exports = router;

/** Add an Event */
router.post(
  '/',
  [
    authorize(Role.Admin),
    [
      check('name', 'Nombre es requerido').not().isEmpty(),
      check('shortName', 'Nombre corto es requerido').not().isEmpty()
    ]
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array() });
    }

    eventsService
      .addEvent(req.body)
      .then((event) => res.json(event))
      .catch(next);
  }
);

/** Update an Event */
router.post(
  '/:id',
  [
    authorize(Role.Admin),
    [
      check('name', 'Nombre es requerido').not().isEmpty(),
      check('shortName', 'Nombre corto es requerido').not().isEmpty()
    ]
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ errors: errors.array() });
    }

    eventsService
      .updateEvent(req.params.id, req.body)
      .then((event) => res.json(event))
      .catch(next);
  }
);

/** Get Event by Id */
router.get('/:id', authorize(Role.Admin), (req, res, next) => {
  eventsService
    .getById(req.params.id)
    .then((event) => res.json(event))
    .catch(next);
});

/** Get Event by shortName */
router.get('/shortName/:shortName', (req, res, next) => {
  eventsService
    .getByShortName(req.params.shortName)
    .then((event) => res.json(event))
    .catch(next);
});

/** Get All Events */
router.get('/', (req, res, next) => {
  eventsService
    .getAllEvents()
    .then((events) => {
      res.json(events);
    })
    .catch(next);
});

/** Delete Event */
router.delete('/:id', authorize(Role.Admin), (req, res, next) => {
  eventsService
    .deleteEvent(req.params.id)
    .then(() => res.json({ message: 'Evento Eliminado' }))
    .catch(next);
});
