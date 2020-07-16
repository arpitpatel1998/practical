const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const publicRouter = require('./routes/public');
const usersRouter = require('./routes/users');

const host = 'localhost';
const dbPort = '27017';
const dbName = 'practical';
mongoose.connect(`mongodb://${host}:${dbPort}${dbName}`, {
  auto_reconnect: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log('Mongo Connected')).catch(() => console.log('Mongo connection Failed'));

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', publicRouter);
app.use('/users', usersRouter);

module.exports = app;
