const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const USER = 'user'

const friendSchema = {
  userId : {
    type : mongoose.Types.ObjectId,
    ref :'user'
  },
  dateTime : {
    type : Date ,
    default : Date.now
  }
}

const userSchema = new mongoose.Schema({

  name : String,
  password: { type : String , required : true},
  email: { type : String , required : true , unique : true , trim : true , lowercase: true},
  friendList: {
    type: [friendSchema],
    default : []
  },
  friendRequest: {
    type: [friendSchema],
    default: []
  },
  sendedRequest : {
    type: [friendSchema],
    default: []
  },
  accessToken : {
    type : Array,
    default : []
  },
  createdTime: {
    type : Date,
    default : Date.now
  },
  updatedAt: Date 
}, {
  collection: USER
});


userSchema.pre('save', async function (cb) {
  try {
    var user = this;
    if (user.password != undefined) {
      user.password = bcrypt.hashSync(this.password, 10);
    }
    cb();
  } catch (error) {
    cb(error);
  }
});

userSchema.pre('updateOne', async function (cb) {
  try {
    var user = this;
    user._update.updatedAt = new Date();
    console.log(user);
    cb();
  } catch (error) {
    cb(error);
  }
});


const user = mongoose.model(USER, userSchema);


module.exports.user = user;
