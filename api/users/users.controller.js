const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const Role = require('../../helpers/role');
const userService = require('./user.service');

module.exports = router;

// Users
router.get('/', authorize(), getUser);
router.get('/getAll', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), create);
router.post('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

// Get user
function getUser(req, res, next) {
  userService
    .getById(req.user.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);
}

//  Get all users-user
function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
}

// Get User by Id
function getById(req, res, next) {
  // users can get their own user and admins can get any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);
}

// Create an User
function create(req, res, next) {
  userService
    .create(req.body)
    .then((user) => res.json(user))
    .catch(next);
}

// Update user by ID
function update(req, res, next) {
  // users can update their own user and admins can update any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  userService
    .update(req.params.id, req.body)
    .then((user) => res.json(user))
    .catch(next);
}

/**
 * Delete user
 */
function _delete(req, res, next) {
  // users can delete their own user and admins can delete any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService
    .delete(req.params.id)
    .then((response) => res.json(response))
    .catch(next);
}
