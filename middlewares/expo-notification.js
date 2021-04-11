const { Expo } = require('expo-server-sdk');
const dotenv = require('dotenv');

dotenv.config();
const expoServer = new Expo({ accessToken: process.env.expoToken });
const isPushToken = (pushToken) => Expo.isExpoPushToken(pushToken);

module.exports = {
  reminderApplication: async (tokens, reminder, callBack) => {
    const messages = [];
    tokens.forEach((item) => {
      if (isPushToken(item)) {
        messages.push({
          to: item,
          sound: 'default',
          body: reminder,
          // data: { withSome: 'data' },
        });
      }
    });

    const chunks = expoServer.chunkPushNotifications(messages);
    // Todo: Test doing chunks of requests
    const successPushes = chunks.map(async (chunk) => {
      try {
        const ticketChunk = await expoServer.sendPushNotificationsAsync(chunk);
        return callBack(null, ticketChunk);
      } catch (e) {
        return callBack(e);
      }
    });

    // eslint-disable-next-line no-console
    console.log(successPushes);
  },
};
