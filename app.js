const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();

dotenv.config();

app.use(
  session({
    secret: process.env.secretOrKey,
    reSave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

// For later research
app.use(passport.initialize());
app.use(passport.session());

app.enable('trust proxy');
app.use(
  cors({
    credentials: true,
  }),
);

// For socket if use
const http = require('http');

const server = http.createServer(app);

// Swagger configuration
const swaggerFile = require('./swagger_output.json');

// const swaggerOptions = {
//   swaggerDefinition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Table Planner User APIs',
//       description: 'Currently Active APIs For Table Planner User Page',
//       contact: {
//         name: 'An Hung Kha Tuan Kiet',
//       },
//     },
//     servers: [{ url: 'https://localhost:3000', description: 'Development Server' }],
//   },
//   apis: ['./routes/users.js'],
// };
app.use('/apis-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));

// Mongo configuration
mongoose.connect(process.env.URI || 'localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Mongo is connecting');
}).catch((err) => {
  console.log(err);
});

mongoose.connection.on('connected', () => {
  console.log('Mongo is successfully connected');
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { app, server };
