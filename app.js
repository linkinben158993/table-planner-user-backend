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
// const swaggerJsDoc = require('swagger-jsdoc');
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
const socket = require('./middlewares/socket-io');

socket.startSocketServer(server);

// Swagger configuration
// eslint-disable-next-line node/no-unpublished-require
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
mongoose
  .connect(process.env.URI || 'localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Test hook before test case if possible
    app.emit('app_started');
  })
  .catch(() => {});

mongoose.connection.on('connected', () => {
  // Test hook before test case if possible
  app.emit('app_started');
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const guestsRouter = require('./routes/guests');
const uploadFileRouter = require('./routes/fileUpload');

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
app.use('/events', eventsRouter);
app.use('/guests', guestsRouter);
app.use('/upload-images', uploadFileRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {
  app,
  server,
};
