const express = require('express');
const router = express.Router();
const {
  jwtChecker
} = require('../middleware/jwtChecker');
const {
  searchFriends,getFriendRequestList,getFriendList,sendFriendRequest,
  acceptRejectFriendRequest,getFriendSuggestions,logoutUser
} = require('../controller/users.controller');

router.use(jwtChecker);
router.post('/logout-user',logoutUser);
router.get('/search-friend/:search',searchFriends);

router.post('/send-friend-request',sendFriendRequest);
router.get('/friend-request-list',getFriendRequestList);
router.get('/friend-list',getFriendList);

router.put('/friend-request-response',acceptRejectFriendRequest);
router.get('/friend-suggestion',getFriendSuggestions);
module.exports = router;
