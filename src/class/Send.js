const UserSchema = require("../models/user.model");
const Fetch = require("./Fetch");
const General = require("./General");
const Favorite = require("./Favorite");
const CallbackQuery = require("./CallbackQuery");
const keyboard = require("../libs/keyboard");
const InlineKeyboard = keyboard.InlineKeyboard;
const cst = require("../libs/const");
const message = cst.msg;

/**
 * Simple caption
 *
 * @param {Array} anime
 * @returns string
 */
const simpleCaption = (anime) => {
  return `<u>Title</u> : <b>${anime.title ? anime.title : "❔"}</b>`;
};

/**
 * Send
 */
class Send {
  /**
   * Send user's favorite anime
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async sendFavorites(bot, msg) {
    const user = await UserSchema.findOne({ chatId: msg.chat.id });
    if (user && user.favorites && user.favorites.length > 0) {
      bot.sendMessage(msg.chat.id, message.FAVORITE_TITLE_MSG, {
        parse_mode: "HTML",
      });
      for (let i = 0; i < user.favorites.length; i++) {
        const favorite = user.favorites[i];
        bot.sendPhoto(msg.chat.id, `${favorite.img}`, {
          caption: `\n⭐️ ${favorite.title.slice(0, 19)}...\n👁 show /anime_${favorite.id}`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: InlineKeyboard.favorite(favorite),
          },
        });
      }
    } else {
      bot.sendMessage(msg.chat.id, message.EMPTY_FAVORITES_MSG, {
        parse_mode: "HTML",
      });
    }
  }

  /**
   * Send user feedback request
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.CallbackQuery} query
   * @param {{value: any}} data
   */
  static async sendFeedbacks(bot, query, data) {
    if (data.value === "Yes") {
      bot.editMessageText(message.FEEDBACK_MSG, {
        parse_mode: "HTML",
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: InlineKeyboard.feedbacks(),
        },
      });
    } else {
      bot.editMessageText("Glad you changed your mind", {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
      });
    }
  }

  /**
   * Send top anime
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   * @param {String} subtype
   */
  static async sendTopAnime(bot, msg, subtype) {
    const wMsg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG, {
      reply_to_message_id: msg.message_id,
    });
    const anime = await Fetch.getTopAnime(subtype);
    const param = msg.text.trim().split(" ")[1] * 1;
    const max = typeof param === "number" && !isNaN(param) ? param : 10;
    if (!param && !(await General.isAdvancedCmdUsed(msg.chat.id))) {
      await bot.sendMessage(msg.chat.id, message.ASTUTE, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: InlineKeyboard.noShowAgain,
        },
      });
    } else if (param && !(await General.isAdvancedCmdUsed(msg.chat.id))) {
      CallbackQuery.advancedCmgIsUsed(msg);
    }
    bot.editMessageText(`👇 Top ${max} anime ${subtype} 👇`, {
      chat_id: msg.chat.id,
      message_id: wMsg.message_id,
    });
    for (let i = 0; i < max; i++) {
      const anm = anime[i];
      const favorite = (await Favorite.isFavorite(msg.chat.id, anm.mal_id)) ? "⭐️" : "☆";
      const caption = simpleCaption(anm);
      bot.sendPhoto(msg.chat.id, anm.image_url, {
        caption,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: InlineKeyboard.showMore(anm.url, anm.mal_id, favorite),
        },
      });
    }
  }

  /**
   * Send Anime
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async sendAnime(bot, msg) {
    const id = msg.text.split("_")[1];
    const Msg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG);
    const anime = await Fetch.getAnimeDetail(id);
    bot.deleteMessage(msg.chat.id, Msg.message_id);
    const favorite = (await Favorite.isFavorite(msg.chat.id, anime.mal_id)) ? "⭐️" : "☆";
    const caption = simpleCaption(anime);
    bot.sendPhoto(msg.chat.id, anime.image_url, {
      caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: InlineKeyboard.showMore(anime.url, anime.mal_id, favorite),
      },
    });
  }

  /**
   * Send the complete synopsis of an anime
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async sendAllSynopsis(bot, msg) {
    const id = msg.text.split("_")[1] * 1;
    const Msg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG, {
      reply_to_message_id: msg.message_id,
    });
    const details = await Fetch.getAnimeDetail(id);
    bot.editMessageText(message.SYNOPSIS_MSG(details), {
      chat_id: msg.chat.id,
      message_id: Msg.message_id,
      parse_mode: "HTML",
    });
  }

  /**
   * Send Trailer
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async sendTrailer(bot, msg) {
    const id = msg.text.split("_")[1] * 1;
    const Msg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG, {
      reply_to_message_id: msg.message_id,
    });
    const details = await Fetch.getAnimeDetail(id);
    if (details.trailer_url) {
      bot.editMessageText(details.trailer_url, {
        reply_to_message_id: msg.message_id,
        chat_id: msg.chat.id,
        message_id: Msg.message_id,
        parse_mode: "HTML",
      });
    } else {
      bot.editMessageText(message.NO_TRAILER_MSG, {
        chat_id: msg.chat.id,
        message_id: Msg.message_id,
      });
    }
  }

  /**
   * Search anime
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async sendSearch(bot, msg) {
    const wMsg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG, {
      reply_to_message_id: msg.message_id,
    });
    const param = msg.text.trim().split(" ")[1];
    const param2 = msg.text.trim().split(" ")[2] * 1;
    if (!param) {
      return await bot.editMessageText(message.SEARCH_ERROR, {
        chat_id: msg.chat.id,
        message_id: wMsg.message_id,
      });
    }
    const anime = await Fetch.searchAnimeByName(param);
    const max = typeof param2 === "number" && !isNaN(param2) ? param2 : anime.length;
    bot.editMessageText(`👇 ${max} results for "${param}" 👇`, {
      chat_id: msg.chat.id,
      message_id: wMsg.message_id,
    });
    for (let i = 0; i < max; i++) {
      const anm = anime[i];
      const favorite = (await Favorite.isFavorite(msg.chat.id, anm.mal_id)) ? "⭐️" : "☆";
      const caption = simpleCaption(anm);
      bot.sendPhoto(msg.chat.id, anm.image_url, {
        caption,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: InlineKeyboard.showMore(anm.url, anm.mal_id, favorite),
        },
      });
    }
  }
}

module.exports = Send;
