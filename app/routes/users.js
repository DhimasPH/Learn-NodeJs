// Set up requirement
const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/Users');

// API

router.post('/', UsersController.create);

router.get('/',UsersController.getAllUser);

router.get('/detail',UsersController.getUserById);

router.put('/:id',UsersController.updateUsers);

module.exports = router