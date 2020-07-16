const express = require('express');
const router = express.Router();

const {
    loginUser,signupUser
} = require('../controller/public.controller');

router.post('/login-user',loginUser);
router.post('/signup-user',signupUser);
module.exports = router;
