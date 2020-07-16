const jwt = require('jsonwebtoken');
const {
 errorResponse
} = require('../helper/responseHelper');
const jwtSecret = 'practicalTest';
const {user} = require('../modal/userModal');
// verify jwt token and return decoded data
module.exports.verifyJwtToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reject();
      }
      resolve(decoded);
    });
  });
};

// check jwt token for every request
module.exports.jwtChecker = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    let values = req.headers.authorization.split(' ');
    let token = values[0].length > 20 ? values[0] : values[1];
    let isExisted = true;
    // check token in db
    let isToken = await user.findOne({
      'accessToken': token
    });
    if (isToken != null) {
      isExisted = true;
    } else {
      isExisted = false;
    }
    if (isExisted) {
      await this.verifyJwtToken(token).then((userData) => {
        // save decoded data in to req.tokenData
        req.user = userData.user;
        next();
      }).catch(() => {
        return errorResponse(res, 'Token expired');
      });
    } else {
      return errorResponse(res, 'Token expired');
    }
  } else {
      return errorResponse(res, 'send authentication token');
  }
};

//  set jwt token and by user data and secret key and set expiry time (45 days)
module.exports.setJwtToken = async (userData) => {
    return jwt.sign({
      user: userData
    }, jwtSecret, {expiresIn: '64d'})
};
