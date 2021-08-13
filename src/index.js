require('dotenv').config();
require('./config/db');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const Favorite = require('./class/Favorite');
const Send = require('./class/Send');
const General = require('./class/General');
const Channel = require('./class/Channel');
const CallbackQuery = require('./class/CallbackQuery');
const Notify = require('./class/Notify');
const cst = require('./libs/const');
const path = require('path');
const cmd = cst.commands;
const subType = cst.subType;
const message = cst.msg;
const callBackQueryType = cst.callBackQueryType;
const FeedbacksSchema = require('./models/feedbacks.model');
const AnimeModel = require('./models/anime.model');

let bot = new TelegramBot();
let notify;
/**
 * Server
 */
if (process.env.NODE_ENV === 'development') {
  bot = new TelegramBot(process.env.TOKEN, {
    polling: true,
  });
  notify = new Notify(bot);
} else {
  const express = require('express');
  bot = new TelegramBot(process.env.TOKEN);
  notify = new Notify(bot);
  const app = express();
  app.use(express.json());
  bot.setWebHook(`${process.env.URL}:443/bot${process.env.TOKEN}`);
  app.use(express.static(path.join(__dirname, './assets')));
  app.set('views', path.join(__dirname, './views'));
  app.set('view engine', 'ejs');
  app.get('/', (req, res) => {
    const markdown = fs
      .readFileSync(path.join(__dirname, '../README.md'), { encoding: 'utf8' })
      .replace(/\.\/src\/assets\//g, '');
    res.render('index', { markdown });
  });
  app.post(`/bot${process.env.TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  app.get('*', (req, res) => {
    res.status(404).send('error !');
  });
  app.listen(process.env.PORT, () => {
    console.log(`Express server is listening on ${process.env.PORT}`);
  });
}

notify.start();

/**
 *  Top Anime
 */
bot.onText(/\/topUpcoming/i, (msg) => {
  Send.sendTopAnime(bot, msg, subType.upComing).catch((err) => {
    console.log(err);
    bot.sendMessage(msg.chat.id, 'Error !');
  });
});

bot.onText(/\/topAiring/i, (msg) => {
  Send.sendTopAnime(bot, msg, subType.airing).catch(() =>
    bot.sendMessage(msg.chat.id, 'Error !')
  );
});

bot.onText(/\/topMovie/i, (msg) => {
  Send.sendTopAnime(bot, msg, subType.movie).catch(() =>
    bot.sendMessage(msg.chat.id, 'Error !')
  );
});

bot.onText(/\/topTv/i, (msg) => {
  Send.sendTopAnime(bot, msg, subType.tv).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/topOva/i, (msg) => {
  Send.sendTopAnime(bot, msg, subType.ova).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/topSpecial/i, (msg) => {
  Send.sendTopAnime(bot, msg, subType.special).catch(() =>
    bot.sendMessage(msg.chat.id, 'Error !')
  );
});

/**
 * Anime
 */
bot.onText(/\/anime/i, async (msg) => {
  Send.sendAnime(bot, msg).catch((err) => {
    console.log(err);
    bot.sendMessage(msg.chat.id, 'Error !');
  });
});

bot.onText(/\/allSynopsis/i, async (msg) => {
  Send.sendAllSynopsis(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/trailer/i, async (msg) => {
  Send.sendTrailer(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/search/i, async (msg) => {
  Send.sendSearch(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/randomWallpaper/i, async (msg) => {
  Send.sendRandomWallpaper(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/wallpaper/i, async (msg) => {
  Send.sendWallpaper(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

/**
 * Favorite
 */
bot.onText(/\/empty_favorites/i, (msg) => {
  Favorite.emptyFavorite(msg.chat.id)
    .then(() => bot.sendMessage(msg.chat.id, message.DONE_MSG))
    .catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/favorites/i, async (msg) => {
  Send.sendFavorites(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

/**
 *  General
 */
bot.onText(/\/start/i, async (msg) => {
  General.start(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/help/i, (msg) => {
  General.help(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/stop/i, async (msg) => {
  General.stop(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

bot.onText(/\/showFeedbacks/i, async (msg) => {
  General.showFeedbacks(bot, msg).catch(() => bot.sendMessage(msg.chat.id, 'Error !'));
});

/**
 * Callback Query
 */
bot.on('callback_query', async (query) => {
  const data = JSON.parse(query.data);
  if (
    data.type === callBackQueryType.SHOW_MORE_T ||
    data.type === callBackQueryType.SHOW_LESS_T
  ) {
    CallbackQuery.toggleDetails(bot, query).catch((err) => {
      console.log(err);
      bot.sendMessage(query.message.chat.id, 'Error !');
    });
  } else if (data.type === callBackQueryType.FAVORITE_T) {
    CallbackQuery.toggleFavorite(bot, query).catch(() =>
      bot.sendMessage(query.message.chat.id, 'Error !')
    );
  } else if (data.type === callBackQueryType.RM_FAVORITE_T) {
    Favorite.deleteFavorite(query.message.chat.id, data.animeId).catch(() =>
      bot.sendMessage(query.message.chat.id, 'Error !')
    );
    bot.deleteMessage(query.message.chat.id, query.message.message_id);
  } else if (data.type === callBackQueryType.CONFIRM_STOP_T) {
    Send.sendFeedbacks(bot, query, data).catch(() =>
      bot.sendMessage(query.message.chat.id, 'Error !')
    );
  } else if (data.type === callBackQueryType.FEEDBACK_T) {
    CallbackQuery.deleteUser(query.message.chat.id)
      .then(() => {
        bot.editMessageText(message.DONE_MSG, {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
        });
        new FeedbacksSchema({ value: data.value }).save();
      })
      .catch(() => bot.sendMessage(query.message.chat.id, 'Error !'));
  } else if (data.type === callBackQueryType.NO_SHOW_AGAIN_T) {
    CallbackQuery.advancedCmgIsUsed(query.message)
      .then(() => bot.deleteMessage(query.message.chat.id, query.message.message_id))
      .catch(() => bot.sendMessage(query.message.chat.id, 'Error !'));
  } else if (data.type === 'pagination') {
    CallbackQuery.pagination(bot, query.message, data);
  }
});

/**
 * Channels post
 */
bot.on('channel_post', async (msg) => {
  /**
   * Anime wallpapers
   */
  if (msg.text === 'Canime') {
    const anime = (await AnimeModel.find().exec())[0];
    if (!anime) return bot.sendMessage(msg.chat.id, 'No anime !');
    return bot.sendMessage(msg.chat.id, `Name : ${anime.name}\nEpisode : ${anime.episode}`);
  }
  if (msg.chat.title === process.env.WALLPAPER_CHANNEL) {
    Channel.saveAwPost(bot, msg);
  }
  if (msg.chat.title === process.env.FORWARDED_CHANNEL || 'test') {
    Channel.forwardPost(bot, msg).catch((err) => {
      console.log(err);
      bot.sendMessage(msg.chat.id, 'Error !');
    });
  }
});

/**
 * Edit channels post
 */
bot.on('edited_channel_post', async (msg) => {
  /**
   * Anime wallpapers
   */
  if (msg.chat.title === 'Anime wallpapers' && msg.photo && msg.caption) {
    Channel.updateAwPost(bot, msg);
  }
});

/**
 * Check Command
 */
bot.onText(/^\//i, async (msg) => {
  const command = msg.text.toLowerCase().trim().split('_')[0].split(' ')[0];
  const isCmd = Object.values(cmd).includes(command);
  if (!isCmd) bot.sendMessage(msg.chat.id, message.NO_UNDERSTAND_MSG);
});
