const UserSchema = require("../models/user.model");
const Fetch = require("./Fetch");
const Favorite = require("./Favorite");
const keyboard = require("../libs/keyboard");
const InlineKeyboard = keyboard.InlineKeyboard;
const cst = require("../libs/const");
const cmd = cst.commands;

/**
 * Simple caption
 *
 * @param {array} anime
 * @returns string
 */
const simpleCaption = (anime) => {
  return `<u>Title</u> : <b>${anime.title ? anime.title : "❔"}</b>`;
};

/**
 *  Detailed caption
 *
 * @param {string} details
 * @param {number} msgId
 * @returns string
 */
const detailedCaption = (details, msgId) => {
  const genres = details.genres.map(
    (genre) => "#" + genre.name.replace(/-/g, "").replace(/ /g, "_")
  );
  const studios = details.studios.map((studio) =>
    `<a href="url">${studio.name.replace(/ /g, "_")}</a>`.replace("url", studio.url)
  );
  return `<u>Japanese Title</u> : <b>${
    details.title_japanese ? details.title_japanese : "❔"
  }</b>\n<u>Title</u> : <b>${details.title}</b>\n<u>Premiered</u> : <b>${
    details.premiered ? details.premiered : "❔"
  }</b>\n<u>Episodes</u> : <b>${
    details.episodes ? details.episodes : "❔"
  }</b>\n<u>Duration</u> : <b>${
    details.duration && details.duration !== "Unknown" ? details.duration : "❔"
  }</b>\n<u>Source</u> : <b>${
    details.source ? "#" + details.source.replace(/ /g, "_") : "❔"
  }</b>\n<u>Type</u> : <b>${
    details.type ? "#" + details.type.replace(/ /g, "_") : "❔"
  }</b>\n<u>Genres</u> : <b>${genres.join(" - ")}</b>\n<u>Studio</u> : <b>${studios.join(
    " - "
  )}</b>\n<u>Synopsis</u> : ${
    details.synopsis
      ? details.synopsis.length > 600
        ? details.synopsis.slice(0, 600) + "... " + `/allSynopsis_${details.mal_id}`
        : details.synopsis
      : "❔"
  }\n<u>Trailer</u> : <b>${cmd.TRAILER_C}_${details.mal_id}</b>`;
};

/**
 * CallbackQuery
 */
class CallbackQuery {
  /**
   * Toggle Details
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async toggleDetails(bot, query) {
    const data = JSON.parse(query.data);
    if (data.animeId) {
      const details = await Fetch.getAnimeDetail(data.animeId);
      const favorite = (await Favorite.isFavorite(query.message.chat.id, data.animeId))
        ? "⭐️"
        : "☆";
      bot.editMessageCaption(
        data.type === "showMore"
          ? detailedCaption(details, query.message.message_id)
          : simpleCaption(details),
        {
          parse_mode: "HTML",
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard:
              data.type === "showMore"
                ? InlineKeyboard.showLess(details.url, data.animeId, favorite)
                : InlineKeyboard.showMore(details.url, details.mal_id, favorite),
          },
        }
      );
    }
  }

  /**
   * Toggle Favorite
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async toggleFavorite(bot, query) {
    const data = JSON.parse(query.data);
    if (data.animeId) {
      const details = await Fetch.getAnimeDetail(data.animeId);
      let favorite;
      if (data.value === "☆") {
        favorite = "⭐️";
        Favorite.addFavorite(query, {
          id: data.animeId,
          title: details.title,
          url: details.url,
          img: details.image_url,
          msg: [query.message.message_id],
        });
      } else {
        favorite = "☆";
        Favorite.deleteFavorite(query.message.chat.id, data.animeId);
      }
      bot.editMessageCaption(
        data.type === "showMore"
          ? detailedCaption(details, query.message.message_id)
          : simpleCaption(details),
        {
          parse_mode: "HTML",
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard:
              data.type === "showMore"
                ? InlineKeyboard.showLess(details.url, data.animeId, favorite)
                : InlineKeyboard.showMore(details.url, details.mal_id, favorite),
          },
        }
      );
    }
  }

  /**
   * Delete user
   *
   * @param {number} chatId
   */
  static async deleteUser(chatId) {
    await UserSchema.deleteOne({ chatId });
  }

  /**
   * Define that the user has already used an Advanced Command
   *
   * @param {TelegramBot.Message} msg
   */
  static async advancedCmgIsUsed(msg) {
    const chatId = msg.chat.id;
    UserSchema.findOne({ chatId }, (err, user) => {
      if (err) return console.log(err);
      if (user) {
        UserSchema.updateOne({ chatId }, { isAdvancedCmdUsed: true }, (err, user) => {
          if (err) return console.log(err);
        });
      } else {
        new UserSchema({
          chatId,
          favorites: [],
          isAdvancedCmdUsed: true,
        }).save();
      }
    });
  }
}

module.exports = CallbackQuery;
