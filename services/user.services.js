const { user } = require('../modal/userModal');
const mongoose = require('mongoose');
exports.getUserDetails = async (value, field = '_id') => {
    try {
        let userData = await user.findOne({
            [`${field}`]: value
        }).lean();
        return userData;
    } catch (error) {
        return error;
    }
}
exports.signup = async ({ name, email, password }) => {
    const signupUser = new user({
        'name': name,
        'email': email,
        'password': password
    });
    const response = await signupUser.save();
    if (response) {
        return response;
    } else {
        return false;
    }
}
exports.saveAccessTokenToDb = async (userId, token) => {
    const saveToken = await user.updateOne({
        _id: mongoose.Types.ObjectId(userId)
    }, {
        $push: {
            accessToken: token
        }
    });
    return saveToken.nModified;
}
exports.saveAccessTokenToDb = async (userId, token) => {
    const saveToken = await user.updateOne({
        _id: mongoose.Types.ObjectId(userId)
    }, {
        $push: {
            accessToken: token
        }
    });
    return saveToken.nModified;
}

exports.userFriendList = async (userId) => {
    const friendList = await user.aggregate([
        {
            '$match': {
                '_id': mongoose.Types.ObjectId(userId)
            }
        }, {
            '$unwind': {
                'path': '$friendList',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            '$lookup': {
                'from': 'user',
                'localField': 'friendList.userId',
                'foreignField': '_id',
                'as': 'friendDetails'
            }
        }, {
            '$unwind': {
                'path': '$friendDetails'
            }
        }, {
            '$addFields': {
                'friendDetails.friendAt': '$friendRequest.dateTime'
            }
        }, {
            '$replaceRoot': {
                'newRoot': '$friendDetails'
            }
        }, {
            '$project': {
                'name': 1,
                'email': 1,
                'requestSendAt': 1
            }
        }, {
            '$sort': {
                'requestSendAt': -1
            }
        }
    ])
    return friendList;
}

exports.searchFriend = async (searchWord , userId) => {
    try {
        let keywordFilter = {
            '$match': {

            }
        };
        if ((searchWord != undefined && searchWord.length > 0) && searchWord != 'undefined') {
            re = new RegExp(`${searchWord}`, 'i');
            keywordFilter.$match = {
                $or: [
                    {
                        'name': re
                    },
                    {
                        'email': re
                    }
                ]
            };

        }
        const userList = await user.aggregate([
            {
                $match : {
                    _id : {
                        $ne : mongoose.Types.ObjectId(userId)
                    }
                }
            },
            {
                '$project': {
                    'name': 1,
                    'email': 1
                }
            },
            keywordFilter,
            {
                '$facet': {
                    'userList': [{
                        '$skip': 0
                    }, {
                        '$limit': 100
                    }],
                    'usersCount': [{
                        '$count': 'count'
                    }]
                }
            }
        ]);
        return userList;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.friendRequest = async (userId, sendTo) => {
    const sendRequest = await user.updateOne({
        _id: mongoose.Types.ObjectId(sendTo)
    }, {
        $push: {
            friendRequest: {
                userId: mongoose.Types.ObjectId(userId)
            }
        }
    });
    if (sendRequest.nModified) {
        const addToRequest = await user.updateOne({
            _id: mongoose.Types.ObjectId(userId)
        }, {
            $push: {
                sendedRequest: {
                    userId: mongoose.Types.ObjectId(sendTo)
                }
            }
        });
        return addToRequest.nModified;
    } else {
        return false;
    }

}

exports.requestFriendList = async (userId) => {
    const requestList = await user.aggregate([
        {
            '$match': {
                '_id': mongoose.Types.ObjectId(userId)
            }
        }, {
            '$unwind': {
                'path': '$friendRequest',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            '$lookup': {
                'from': 'user',
                'localField': 'friendRequest.userId',
                'foreignField': '_id',
                'as': 'friendDetails'
            }
        }, {
            '$unwind': {
                'path': '$friendDetails'
            }
        }, {
            '$addFields': {
                'friendDetails.requestSendAt': '$friendRequest.dateTime'
            }
        }, {
            '$replaceRoot': {
                'newRoot': '$friendDetails'
            }
        }, {
            '$project': {
                'name': 1,
                'email': 1,
                'requestSendAt': 1
            }
        }, {
            '$sort': {
                'requestSendAt': -1
            }
        }
    ]);
    return requestList;
}

exports.acceptFriendRequest = async (userId, friendId) => {
    try {
        await user.updateOne({
            _id: mongoose.Types.ObjectId(friendId)
        }, {
            $push: {
                friendList: {
                    userId: mongoose.Types.ObjectId(userId)
                }
            },
            $pull: {
                'sendedRequest': {
                    userId:
                        mongoose.Types.ObjectId(userId)
                }
            },

        });
        const sendRequest = await user.updateOne({
            _id: mongoose.Types.ObjectId(userId)
        }, {
            $push: {
                friendList: {
                    userId: mongoose.Types.ObjectId(friendId)
                }
            }
            ,
            $pull: {
                'friendRequest': {
                    userId:
                        mongoose.Types.ObjectId(friendId)

                }
            },

        });
        return sendRequest.nModified;
    } catch (error) {
        console.log(error);
    }
}

exports.rejectFriendRequest = async (userId, friendId) => {
    await user.updateOne({
        _id: mongoose.Types.ObjectId(friendId)
    }, {
        $pull: {
            'sendedRequest': {
                userId:
                    mongoose.Types.ObjectId(userId)
            }
        },

    });
    const sendRequest = await user.updateOne({
        _id: mongoose.Types.ObjectId(userId)
    }, {
        $pull: {
            'friendRequest': {
                userId:
                    mongoose.Types.ObjectId(friendId)

            }
        }
    });
    return sendRequest.nModified;
}

exports.logout = async (userId, token) => {
    try {
        const logoutFlag = await user.updateOne({
            _id: mongoose.Types.ObjectId(userId)
        }, {
            $pull: {
                accessToken: token
            }
        }
        );
        return logoutFlag.nModified;
    } catch (error) {
        return false;
    }
}

exports.checkIsFriend = async (userId, friendId) => {
    return user.findOne({
        _id: mongoose.Types.ObjectId(userId),
        'friendList.userId': mongoose.Types.ObjectId(friendId)
    })
}

exports.alreadySendRequest = async (userId, friendId) => {
    return user.findOne({
        _id: mongoose.Types.ObjectId(userId),
        'sendedRequest.userId': mongoose.Types.ObjectId(friendId)
    })
}
exports.alreadyReceivedRequest = async (userId, friendId) => {
    return user.findOne({
        _id: mongoose.Types.ObjectId(userId),
        'friendRequest.userId': mongoose.Types.ObjectId(friendId)
    })
}

exports.friendSuggestion = async (userId) =>{
    const userList = await user.aggregate([
        {
          '$match': {
            '_id': mongoose.Types.ObjectId(userId)
          }
        }, {
          '$unwind': {
            'path': '$friendList', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'user', 
            'localField': 'friendList.userId', 
            'foreignField': '_id', 
            'as': 'friend'
          }
        }, {
          '$unwind': {
            'path': '$friend'
          }
        }, {
          '$unwind': {
            'path': '$friend.friendList'
          }
        }, {
          '$project': {
            'name': 1, 
            'email': 1, 
            'friendList': '$friend.friendList'
          }
        }, {
          '$match': {
            'friendList.userId': {
              '$ne': mongoose.Types.ObjectId(userId)
            }
          }
        }, {
          '$lookup': {
            'from': 'user', 
            'localField': 'friendList.userId', 
            'foreignField': '_id', 
            'as': 'friendDetails'
          }
        }, {
          '$unwind': {
            'path': '$friendDetails'
          }
        }, {
          '$project': {
            '_id': '$friendDetails._id', 
            'name': '$friendDetails.name', 
            'email': '$friendDetails.email'
          }
        }, {
          '$group': {
            '_id': '$_id', 
            'user': {
              '$first': '$$ROOT'
            }
          }
        }
      ]);
      return userList;
}
