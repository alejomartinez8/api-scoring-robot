const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const Role = require('../../helpers/role');
const userService = require('../services/user.service');

module.exports = router;

// Routes
router.get('/', authorize(), getUser);
router.get('/getAll', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), addUser);
router.post('/:id', authorize(), updateUser);
router.delete('/:id', authorize(), deleteUser);

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

// Add an User
function addUser(req, res, next) {
  userService
    .addUser(req.body)
    .then((user) => res.json(user))
    .catch(next);
}

// Update user by ID
function updateUser(req, res, next) {
  // users can update their own user and admins can update any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  userService
    .updateUser(req.params.id, req.body)
    .then((user) => res.json(user))
    .catch(next);
}

/**
 * Delete user
 */
function deleteUser(req, res, next) {
  // users can delete their own user and admins can delete any user
  if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService
    .deleteUser(req.params.id)
    .then((response) => res.json(response))
    .catch(next);
}
