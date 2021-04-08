require("dotenv").config();
require("./config/db");
const TelegramBot = require("node-telegram-bot-api");
const libs = require("./libs");
const cst = require("./libs/const");
const cmd = cst.commands;
const message = cst.msg;
const callBackQueryType = cst.callBackQueryType;
const { getAnimeDetail } = require("./libs/fetch");
const UserSchema = require("./models/user.model");
const FeedbacksSchema = require("./models/feedbacks.model");

let bot = new TelegramBot();

if (process.env.DEVELOPMENT) {
  bot = new TelegramBot(process.env.TOKEN, {
    polling: true,
  });
} else {
  const express = require("express");
  bot = new TelegramBot(process.env.TOKEN);
  const app = express();
  app.use(express.json());
  console.log(`${process.env.URL}:443/bot${process.env.TOKEN}`)
  bot.setWebHook(`${process.env.URL}:443/bot${process.env.TOKEN}`);
  app.post(`/bot${process.env.TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  app.listen(process.env.PORT, () => {
    console.log(`Express server is listening on ${process.env.PORT}`);
  });
}

bot.on("sticker", (msg) => {
  console.log(msg.sticker.file_id);
});

bot.on("message", async (msg) => {
  if (msg.text) {
    // TOP UPCOMING
    if (libs.isKeyWord(msg.text, "UPCOMING_KW"))
      libs.sendTopAnime(bot, msg, cmd.TOPUPCOMING_C.replace("/top", ""));
    // TOP AIRING
    else if (libs.isKeyWord(msg.text, "AIRING_KW"))
      libs.sendTopAnime(bot, msg, cmd.TOPAIRING_C.replace("/top", ""));
    // TOP MOVIE
    else if (libs.isKeyWord(msg.text, "MOVIE_KW"))
      libs.sendTopAnime(bot, msg, cmd.TOPMOVIE_C.replace("/top", ""));
    // TOP TV
    else if (libs.isKeyWord(msg.text, "TV_KW"))
      libs.sendTopAnime(bot, msg, cmd.TOPTV_C.replace("/top", ""));
    // TOP OAV
    else if (libs.isKeyWord(msg.text, "OVA_KW"))
      libs.sendTopAnime(bot, msg, cmd.TOPOVA_C.replace("/top", ""));
    // TOP SPECIAL
    else if (libs.isKeyWord(msg.text, "SPECIAL_KW"))
      libs.sendTopAnime(bot, msg, cmd.TOPSPECIAL_C.replace("/top", ""));
    // SEARCH
    else if (msg.text.toLowerCase().search(cmd.SEARCH_C.replace("/", "")) !== -1)
      libs.search(bot, msg);
    // Anime
    else if (msg.text.toLowerCase().search(cmd.ANIME_C.replace("/", "")) !== -1)
      libs.sendAnime(bot, msg);
    // HELP
    else if (msg.text.indexOf("/") !== 0) {
      if (libs.isKeyWord(msg.text, "HELLO_KW")) {
        bot.sendMessage(msg.chat.id, libs.sayHello(), {
          parse_mode: "HTML",
        });
      } else {
        bot.sendMessage(msg.chat.id, libs.noUnderstand(), {
          parse_mode: "HTML",
        });
      }
    }
  }
});

bot.on("callback_query", async (query) => {
  const data = JSON.parse(query.data);
  if (data.type === callBackQueryType.SHOW_MORE_T) libs.toggleDetails(bot, query);
  else if (data.type === callBackQueryType.SHOW_LESS_T) libs.toggleDetails(bot, query, data);
  else if (data.type === callBackQueryType.FAVORITE_T) libs.toggleFavorite(bot, query);
  else if (data.type === callBackQueryType.RM_FAVORITE_T) {
    libs.removeFavorite(
      query.message.chat.username,
      JSON.parse(query.data).animeId,
      bot,
      query.message
    );
    bot.deleteMessage(query.message.chat.id, query.message.message_id);
  } else if (data.type === callBackQueryType.CONFIRM_STOP_T) {
    libs.sendFeedbacks(bot, query, data);
  } else if (data.type === callBackQueryType.FEEDBACK_T) {
    libs.removeContact(query.message.chat.username);
    bot.editMessageText(message.DONE_MSG, {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
    });
    new FeedbacksSchema({ value: data.value }).save();
  } else if (data.type === callBackQueryType.NO_SHOW_AGAIN_T) {
    bot.deleteMessage(query.message.chat.id, query.message.message_id);
    libs.advancedCmgIsUsed(query.message.chat.username);
  }
});

bot.onText(/\/allSynopsis/i, async (msg) => {
  const id = msg.text.split("_")[1] * 1;
  const msgId = msg.text.split("_")[2] * 1;
  console.log(msgId);
  const w_msg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG, {
    reply_to_message_id: msgId,
  });
  const details = await getAnimeDetail(id);
  bot.editMessageText(message.SYNOPSIS_MSG(details), {
    chat_id: msg.chat.id,
    message_id: w_msg.message_id,
    parse_mode: "HTML",
  });
});

bot.onText(/\/start/i, async (msg) => {
  const user = await UserSchema.findOne({ name: msg.chat.username });
  if (!user) {
    const newUser = new UserSchema();
    newUser.name = msg.chat.username;
    newUser.favorites = [];
    newUser.isAdvancedCmdUsed = false;
    await newUser.save();
  }
  bot.sendMessage(msg.chat.id, libs.welcome(msg) + libs.commandsList(), {
    parse_mode: "HTML",
  });
});

bot.onText(/\help/i, (msg) => {
  bot.sendMessage(msg.chat.id, libs.commandsList(), {
    parse_mode: "HTML",
  });
});

bot.onText(/\/stop/i, async (msg) => {
  libs.stop(bot, msg);
});

bot.onText(/\/empty_favorites/i, (msg) => {
  libs.emptyFavorite(msg.chat.username);
  bot.sendMessage(msg.chat.id, message.DONE_MSG);
});

bot.onText(/\/favorites/i, async (msg) => {
  libs.sendFavorites(bot, msg);
});

bot.onText(/\/trailer/i, async (msg) => {
  const id = msg.text.split("_")[1] * 1;
  const msgId = msg.text.split("_")[2] * 1;
  const w_msg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG, {
    reply_to_message_id: msgId,
  });
  const details = await getAnimeDetail(id);
  if (details.trailer_url) {
    bot.editMessageText(details.trailer_url, {
      reply_to_message_id: msgId,
      chat_id: msg.chat.id,
      message_id: w_msg.message_id,
      parse_mode: "HTML",
    });
  } else {
    bot.editMessageText(message.NO_TRAILER_MSG, {
      chat_id: msg.chat.id,
      message_id: w_msg.message_id,
    });
  }
});

bot.onText(/\/watch/i, async (msg) => {
  libs.sendAnimeFromChanel(bot, msg);
});

bot.onText(/\/showFeedbacks/i, async (msg) => {
  libs.showFeedbacks(bot, msg);
});

//check command
bot.onText(/^\//i, async (msg) => {
  if (libs.isCmd(msg)) {
    bot.sendMessage(msg.chat.id, message.NO_UNDERSTAND_MSG);
  }
});

/*************
 ****CHANEL***
 *************/

bot.on("channel_post", async (msg) => {
  if (msg.photo && msg.photo[0]) {
    new AnimeSchema({
      file_id: msg.photo[0].file_id,
      caption: msg.caption ? msg.caption : "",
    }).save();
  } else {
  }
});

bot.on("edited_channel_post", async (msg) => {
  /*if (msg.photo && msg.photo[0] && msg.forward_from_message_id) {
    await AnimeSchema.findOneAndUpdate(
      { msgId: msg.message_id },
      {
        msgId: msg.forward_from_message_id,
        img: msg.photo[0].file_id,
        caption: msg.caption ? msg.caption.toLowerCase() : "",
      }
    );
  }*/
});
