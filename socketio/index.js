const socketio = require('socket.io');

module.exports.listen = function (app) {
  const io = socketio(app);

  io.on('connection', async (socket) => {
    socket.emit('announcements', { message: 'A new user has joined!' });
  });
  return io;
};
