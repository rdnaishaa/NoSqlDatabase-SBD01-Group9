const express = require('express');
const { getUsers } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.get('/', authorize('admin'), protect, getUsers);

module.exports = router;