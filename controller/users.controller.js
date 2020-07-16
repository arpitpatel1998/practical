const {
    requestFriendList,
    userFriendList,
    searchFriend,
    friendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getUserDetails,
    checkIsFriend,
    alreadySendRequest,
    alreadyReceivedRequest,
    friendSuggestion,
    logout
} = require('../services/user.services');
const {
    successResponse,
    errorResponse
} = require('../helper/responseHelper');


exports.sendFriendRequest = async (req, res) => {
    if (await getUserDetails(req.body.sendTo)) {
        if (await checkIsFriend(req.user._id, req.body.sendTo)) {
            return errorResponse(res, 'User is already your friend');
        }
        if (await alreadySendRequest(req.user._id, req.body.sendTo)) {
            return errorResponse(res, 'Friend request already sended');
        }else{
            if(await alreadyReceivedRequest(req.user._id, req.body.sendTo))
            {
                return errorResponse(res, 'Already received request from friend');
            }
        }
    } else {
        return errorResponse(res, 'User not found',404);
    }
    const response = await friendRequest(req.user._id, req.body.sendTo);
    if (response) {
        return successResponse(res, 'friend request sent');
    } else {
        return errorResponse(res, 'friend request already sended');
    }
}

exports.searchFriends = async (req, res) => {
    const searchResult = await searchFriend(req.params.search , req.user._id);
    return successResponse(res, 'search result', searchResult);

}
exports.getFriendRequestList = async (req, res) => {
    const response = await requestFriendList(req.user._id, req.body.sendTo);
    return successResponse(res, 'friend requests list', response);
}
exports.getFriendList = async (req, res) => {
    const friendList = await userFriendList(req.user._id);
    return successResponse(res, 'user friend list', friendList);
}
exports.acceptRejectFriendRequest = async (req, res) => {

    if(! await alreadyReceivedRequest(req.user._id, req.body.friendId))
    {
        return errorResponse(res,'Not received request from user');
    }
    if (req.body.accept === 'true' || req.body.accept === true) {
        const response = await acceptFriendRequest(req.user._id, req.body.friendId)
        return successResponse(res, 'friend request accepted successfully');
    } else {
        const response = await rejectFriendRequest(req.user._id, req.body.friendId)
        return successResponse(res, 'friend request rejected successfully');
    }
}

exports.logoutUser = async (req, res) => {
    try {
        const values = req.headers.authorization.split(' ');
        const jwtToken = values[0].length > 20 ? values[0] : values[1];
        // remove jwt token from db
        const logoutFlag = await logout(req.user._id, jwtToken);
        if (logoutFlag) {
            return successResponse(res, 'User logout successfully');
        } else {
            return errorResponse(res, 'Logout failed please try again');
        }
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'Something Went wrong, Server error', 500);
    }
}
exports.getFriendSuggestions = async (req, res) => {
    const friendSuggestionList = await friendSuggestion(req.user._id);
    return successResponse(res,'Friend Suggestion List',friendSuggestionList);
}