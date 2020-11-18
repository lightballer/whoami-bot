const TelegramBot = require('node-telegram-bot-api');

const { token } = require('./token'); 

const usernames = [];
const roles = ['Папич', 'Шевцов', 'Понасенков', 'Андрей Киреев']; // should be changed to dictionary
const chatIds = {};

const bot = new TelegramBot(token, {polling: true});

const options = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'Участвовать', callback_data: '1'}],
    ]
  })
};

bot.onText(/\/play/, (msg, match) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  if (chatType === 'group') bot.sendMessage(chatId, 'Нажми на кнопку - получишь результат', options);
});

bot.onText(/\/start/, (msg, match) => {
  if (msg.chat.type !== 'group') return;
  const userRoles = distributeRoles(usernames, roles);
  for (const name of usernames) {
    const message = generateMessage(userRoles, name);
    bot.sendMessage(chatIds[name], message);
  }
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  if (action == '1') {
    bot.getUpdates().then(data => {
      const username = data[0].callback_query.from.username;
      chatIds[username] = data[0].callback_query.from.id;
      if (!usernames.includes(username)) usernames.push(username);
    });
  }
});

const distributeRoles = (usernames, roles) => {
  const result = {};
  for (const name of usernames) {
    const index = Math.floor(Math.random() * (roles.length - 1));
    result[name] = roles[index];
    roles.splice(index, 1);
  }
  return result;
};

const generateMessage = (userRoles, user) => {
  let result = '';
  for (const player in userRoles) {
    if (player != user) result += '@' + player + ' - ' + userRoles[player] + '\n';
  }
  return result;
};
