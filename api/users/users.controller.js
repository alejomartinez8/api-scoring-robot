const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('middleware/validate-request');
const authorize = require('middleware/authorize');
const Role = require('helpers/role');
const userService = require('./user.service');

module.exports = router;

// Users
router.get('/', authorize(), getUser);
router.get('/getAll', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.post('/:id', authorize(), updateSchema, update);
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

// Validate User Schema
function createSchema(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    institution: Joi.string().empty(''),
    city: Joi.string().empty(''),
    country: Joi.string().empty(''),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().valid(Role.Admin, Role.Judge, Role.User).required()
  });
  validateRequest(req, next, schema);
}

// Create an User
function create(req, res, next) {
  userService
    .create(req.body)
    .then((user) => res.json(user))
    .catch(next);
}

// Validate User Schema
function updateSchema(req, res, next) {
  const schemaRules = {
    firstName: Joi.string().empty(''),
    lastName: Joi.string().empty(''),
    email: Joi.string().email().empty(''),
    password: Joi.string().min(6).empty(''),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
    institution: Joi.string().empty(''),
    city: Joi.string().empty(''),
    country: Joi.string().empty(''),
    bio: Joi.string().empty('')
  };

  // only admins can update role
  if (req.user.role === Role.Admin) {
    schemaRules.role = Joi.string().valid(Role.Admin, Role.Judge, Role.User).empty('');
  }

  const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
  validateRequest(req, next, schema);
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
    .then(() => res.json({ message: 'User deleted successfully' }))
    .catch(next);
}
