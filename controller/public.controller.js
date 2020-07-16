const {
    getUserDetails,
    signup,
    saveAccessTokenToDb
} = require('../services/user.services');
const {
    successResponse,
    errorResponse
} = require('../helper/responseHelper');
const {
    setJwtToken
} = require('../middleware/jwtChecker');
const bcrypt = require('bcryptjs');
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,7})+$/;
const nameRegex = /^[a-zA-Z ]{2,30}$/;

exports.loginUser = async ({ body: { email, password } }, res) => {
    try {
        const user = await getUserDetails(email, 'email');
        if (user) {
            const passwordFlag = bcrypt.compareSync(password, user.password);
            if (passwordFlag) {
                delete user.password;
                delete user.friendList;
                delete user.friendRequest;
                delete user.accessToken;
                const token = await setJwtToken(user);
                user.accessToken = token;
                await saveAccessTokenToDb(user._id, token)
                return successResponse(res, 'Login successfully', user)
            } else {
                return errorResponse(res, 'Invalid credentials');
            }
        } else {
            return errorResponse(res, 'Invalid credentials');
        }
    } catch (error) {
        return errorResponse(res, 'Something Went wrong, Server error', 500);
    }
}

exports.signupUser = async (req, res) => {
    try {
        if(!emailRegex.test(req.body.email))
        {
            return errorResponse(res,'Enter valid email');
        }
        if(!nameRegex.test(req.body.name))
        {
            return errorResponse(res,'Enter valid name');
        }
        if(!(req.body.password && (req.body.password.length > 8) ))
        {
            return errorResponse(res,'Password must be more than 8 character');    
        }
        if(await getUserDetails(req.body.email,'email'))
        {
            return errorResponse(res,'Email is already registered');
        }
        const response = await signup(req.body);
        console.log(response.message);
        if (response) {
            return successResponse(res, 'user signup successfully.');
        } else {
            return errorResponse(res, 'user signup failed, please try again.');
        }
    }
    catch (error) {
        console.log(error);
        return errorResponse(res, 'Something Went wrong, Server error', 500);
    }
}