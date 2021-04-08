const { getTopAnime, getAnimeDetail, searchAnimeByName } = require("./fetch");
const cst = require("./const");
const cmd = cst.commands;
const message = cst.msg;
const callBackQueryType = cst.callBackQueryType;
const keyWords = cst.keyWords;
const { LOADER_S } = cst.sticker;
const UserSchema = require("../models/user.model");
const FeedbacksSchema = require("../models/feedbacks.model");
const AnimeSchema = require("../models/anime.model");

const addFavorite = async (contact, favorite) => {
  UserSchema.findOne({ name: contact }, (err, user) => {
    if (err) return console.log(err);
    if (user) {
      const isFavorite = user.favorites.filter((f) => f.id === favorite.id);
      if (!isFavorite[0]) {
        user.favorites.push(favorite);
        UserSchema.updateOne({ name: contact }, { favorites: user.favorites }, (err, user) => {
          if (err) return console.log(err);
        });
      }
    } else {
      new UserSchema({
        name: contact,
        favorites: [favorite],
        isAdvancedCmdUsed: false,
      }).save();
    }
  });
};

const addMsgToFavorites = async (contact, favoriteId, msgId) => {
  UserSchema.findOne({ name: contact }, (err, user) => {
    if (err) return console.log(err);
    if (user) {
      const favorite = user.favorites.filter((f) => f.id === favoriteId)[0];
      if (favorite) {
        const msg = favorite.msg.filter((m) => m === msgId);
        if (msg.length === 0) {
          favorite.msg.push(msgId);
          const newFavorites = user.favorites.filter((f) => f.id !== favoriteId);
          newFavorites.push(favorite);
          UserSchema.updateOne({ name: contact }, { favorites: newFavorites }, (err, user) => {
            if (err) return console.log(err);
          });
        }
      }
    }
  });
};

const removeFavorite = async (contact, animeId, bot, msg) => {
  UserSchema.findOne({ name: contact }, (err, user) => {
    if (err) return console.log(err);
    if (user) {
      const newFavorites = user.favorites.filter((f) => {
        if (f.id === animeId) {
          f.msg.map((i) => {
            if (msg.message_id !== i) bot.deleteMessage(msg.chat.id, i);
          });
        }
        return f.id !== animeId;
      });
      UserSchema.updateOne({ name: contact }, { favorites: newFavorites }, (err, user) => {
        if (err) return console.log(err);
      });
    }
  });
};

const emptyFavorite = async (contact) => {
  UserSchema.findOne({ name: contact }, (err, user) => {
    if (err) return console.log(err);
    if (user) {
      UserSchema.updateOne({ name: contact }, { favorites: [] }, (err, user) => {
        if (err) return console.log(err);
      });
    }
  });
};

const isFavorite = async (contact, animeId) => {
  const user = await UserSchema.findOne({ name: contact });
  if (user) return user.favorites.filter((f) => f.id === animeId).length === 1;
  else return false;
};

const removeContact = async (contact) => {
  UserSchema.deleteOne({ name: contact }, (err, res) => {
    if (err) return console.log(err);
  });
};

const isAdvancedCmdUsed = async (contact) => {
  const user = await UserSchema.findOne({ name: contact });
  if (user) return user.isAdvancedCmdUsed;
  else return false;
};

const advancedCmgIsUsed = async (contact) => {
  UserSchema.findOne({ name: contact }, (err, user) => {
    if (err) return console.log(err);
    if (user) {
      UserSchema.updateOne({ name: contact }, { isAdvancedCmdUsed: true }, (err, user) => {
        if (err) return console.log(err);
      });
    } else {
      new UserSchema({
        name: contact,
        favorites: [],
        isAdvancedCmdUsed: true,
      }).save();
    }
  });
};

const commandsList = () => {
  return `🌿 Here is the list of available commands 🌿\n\n☘️ Simple commands \n  <code>${cmd.TOPUPCOMING_C}</code> - top upcoming on MyAnimeList \n  <code>${cmd.TOPAIRING_C}</code> - top tv on MyAnimeList \n  <code>${cmd.TOPMOVIE_C}</code> - top movie on MyAnimeList \n  <code>${cmd.TOPTV_C}</code> - top tv on MyAnimeList \n  <code>${cmd.TOPOVA_C}</code> - top ova on MyAnimeList \n  <code>${cmd.TOPSPECIAL_C}</code> - top special on MyAnimeList
  \n🍀 Advanced commands
  <code>/search</code> <code>name</code> - search an anime by name
  <code>/watch</code> <code>name</code> - watch an anime
  <code>${cmd.TOPUPCOMING_C}</code> <code>x</code> - x is the number of result (max <code>50</code>) \n  <code>${cmd.TOPAIRING_C}</code> <code>x</code> - x is the number of result (max <code>50</code>) \n  <code>${cmd.TOPMOVIE_C}</code> <code>x</code> - x is the number of result (max <code>50</code>) \n  <code>${cmd.TOPTV_C}</code> <code>x</code> - x is the number of result (max <code>50</code>) \n  <code>${cmd.TOPOVA_C}</code> <code>x</code> - x is the number of result (max <code>50</code>) \n  <code>${cmd.TOPSPECIAL_C}</code> <code>x</code> - x is the number of result (max <code>50</code>)
   `;
};
const noUnderstand = () => {
  return `Sorry 😅, I am only able to understand a limited number of predefined sentences, and I also ignore sentences that do not contain a certain number of keywords. As in the following examples

1) Top #upcoming anime 🟢
2) The top music album of the moment 🔴
  \n<b>Or try the following commands</b> ${cmd.HELP_C}`;
};

const sayHello = () => {
  const helloWord = Math.round(Math.random() * 1) === 0 ? "Hi" : "Hello";
  const body =
    Math.round(Math.random() * 1) === 0
      ? `do you need anything ?  ${cmd.HELP_C}`
      : `need ${cmd.HELP_C} ?`;
  return `${helloWord} 👋, ${body}`;
};

const welcome = (msg) => {
  return `Hi 👋, ${msg.chat.first_name}, my name is Animo, I'm a kind of assistant bot in the anime field. I can find the best upcoming anime, airing, of all time, etc...  I can help you find 🔍 an anime from the name you provide me, you can also ask me to create a favorites ⭐️ list for you and many other things. Here is a list of commands you should know\n\n`;
};

const simpleCaption = (anime) => {
  return `<u>Title</u> : <b>${anime.title ? anime.title : "❔"}</b>`;
};

const detailedCaption = (details, msgId) => {
  const genres = details.genres.map(
    (genre) => "#" + genre.name.replace(/-/g, "").replace(/ /g, "_")
  );
  const studios = details.studios.map((studio) =>
    `<a href="url">${studio.name.replace(/ /g, "_")}</a>`.replace("url", studio.url)
  );
  //
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
        ? details.synopsis.slice(0, 600) + "... " + `/allSynopsis_${details.mal_id}_${msgId}`
        : details.synopsis
      : "❔"
  }\n<u>Trailer</u> : <b>${cmd.TRAILER_C}${details.mal_id}_${msgId}</b>`;
};

const animeMoreInlineKeyboard = (url, id, favorite) => {
  return [
    [
      { text: "🔗 Url", url },
      {
        text: favorite,
        callback_data: JSON.stringify({
          type: callBackQueryType.FAVORITE_T,
          animeId: id,
          value: favorite,
        }),
      },
    ],
    [
      {
        text: "⬇️ More",
        callback_data: JSON.stringify({
          type: callBackQueryType.SHOW_MORE_T,
          animeId: id,
        }),
      },
    ],
  ];
};

const animeLessInlineKeyboard = (url, id, favorite) => {
  return [
    [
      { text: "🔗 Url", url },
      {
        text: favorite,
        callback_data: JSON.stringify({
          type: callBackQueryType.FAVORITE_T,
          animeId: id,
          value: favorite,
        }),
      },
    ],
    [
      {
        text: "⬆️ Less",
        callback_data: JSON.stringify({
          type: callBackQueryType.SHOW_LESS_T,
          animeId: id,
        }),
      },
    ],
  ];
};

module.exports.isCmd = (msg) => {
  return (
    msg.text.toLowerCase().search(cmd.TOPUPCOMING_C) === -1 &&
    msg.text.toLowerCase().search(cmd.TOPAIRING_C) === -1 &&
    msg.text.toLowerCase().search(cmd.TOPMOVIE_C) === -1 &&
    msg.text.toLowerCase().search(cmd.TOPTV_C) === -1 &&
    msg.text.toLowerCase().search(cmd.TOPOVA_C) === -1 &&
    msg.text.toLowerCase().search(cmd.TOPSPECIAL_C) === -1 &&
    msg.text.toLowerCase().search(cmd.ANIME_C) === -1 &&
    msg.text.toLowerCase().search(cmd.SEARCH_C) === -1 &&
    msg.text.toLowerCase().search(cmd.WATCH_C) === -1 &&
    msg.text.toLowerCase().search(cmd.SHOW_FEEDBACKS_C) === -1 &&
    msg.text.search(cmd.ALLSYNOPSIS_C) === -1 &&
    msg.text.search(cmd.TRAILER_C) === -1 &&
    msg.text.toLowerCase() !== cmd.START_C &&
    msg.text.toLowerCase() !== cmd.HELP_C &&
    msg.text.toLowerCase() !== cmd.STOP_C &&
    msg.text.toLowerCase() !== cmd.EMPTY_C &&
    msg.text.toLowerCase() !== cmd.FAVORITES_C
  );
};

module.exports.isKeyWord = (msg, type) => {
  if (msg) {
    const wordsFound = keyWords[type].filter((keyword) => msg.toLowerCase().search(keyword) !== -1);
    return wordsFound.length > 0;
  }
};

module.exports.stop = async (bot, msg) => {
  const user = await UserSchema.findOne({ name: msg.chat.username });
  if (user) {
    bot.sendMessage(msg.chat.id, message.ARE_SURE_LEAVE, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Yes",
              callback_data: JSON.stringify({
                type: callBackQueryType.CONFIRM_STOP_T,
                value: "Yes",
              }),
            },
            {
              text: "No",
              callback_data: JSON.stringify({
                type: callBackQueryType.CONFIRM_STOP_T,
                value: "No",
              }),
            },
          ],
        ],
      },
    });
  } else {
    bot.sendMessage(msg.chat.id, message.NOT_YET_REGISTERED_MSG);
  }
};

module.exports.showFeedbacks = async (bot, msg) => {
  const password = msg.text.toLowerCase().replace(cmd.SHOW_FEEDBACKS_C, "").trim().split(" ");
  if (password && password[0] === process.env.PASS) {
    const feedbacks = await FeedbacksSchema.find();
    if (feedbacks.length > 0) {
      const weary = Math.round(
        (feedbacks.filter((f) => f.value === "😩").length * 100) / feedbacks.length
      );
      const neuter = Math.round(
        (feedbacks.filter((f) => f.value === "😐").length * 100) / feedbacks.length
      );
      const star_struck = 100 - (weary + neuter);
      bot.sendMessage(msg.chat.id, message.FEEDBACKS_MSG(weary, neuter, star_struck), {
        parse_mode: "HTML",
      });
    } else {
      bot.sendMessage(msg.chat.id, message.NO_FEEDBACKS);
    }
  } else {
    bot.sendMessage(msg.chat.id, message.TRY_AGAIN);
  }
};

module.exports.sendAnimeFromChanel = async (bot, msg) => {
  const animeName = msg.text.replace("/watch", "");
  if (animeName.trim().length > 2) {
    const anime = await AnimeSchema.find();
    const result = anime.filter((a) => a.caption.search(animeName.toLowerCase().trim()) !== -1);
    if (result.length > 0) {
      for (let i = 0; i < 50; i++) {
        const r = result[i];
        bot.sendPhoto(msg.chat.id, r.img, {
          caption: r.caption,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "👀 watch",
                  url: `${process.env.CANAL_LINK}/${r.msgId}`,
                },
              ],
            ],
          },
        });
      }
    } else {
      bot.sendMessage(msg.chat.id, message.NO_ANIME_MSG, { parse_mode: "HTML" });
    }
  } else {
    bot.sendMessage(msg.chat.id, message.WATCH_EMPTY_NAME_MSG, { parse_mode: "HTML" });
  }
};

module.exports.sendFavorites = (bot, msg) => {
  UserSchema.findOne({ name: msg.chat.username }, (err, user) => {
    if (err) return console.log(err);
    if (user && user.favorites && user.favorites.length > 0) {
      bot.sendMessage(msg.chat.id, message.FAVORITE_TITLE_MSG, {
        parse_mode: "HTML",
      });
      user.favorites.map((f) => {
        bot.sendPhoto(msg.chat.id, `${f.img}`, {
          caption: `\n⭐️ ${f.title.slice(0, 19)}...\n👁 show /anime_${f.id}`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔗 Url",
                  url: f.url,
                },
                {
                  text: "🗑",
                  callback_data: JSON.stringify({
                    type: callBackQueryType.RM_FAVORITE_T,
                    animeId: f.id,
                  }),
                },
              ],
            ],
          },
        });
      });
    } else {
      bot.sendMessage(msg.chat.id, message.EMPTY_FAVORITES_MSG, {
        parse_mode: "HTML",
      });
    }
  });
};

module.exports.sendFeedbacks = (bot, query, data) => {
  if (data.value === "Yes") {
    bot.editMessageText(message.FEEDBACK_MSG, {
      parse_mode: "HTML",
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "😩",
              callback_data: JSON.stringify({ type: callBackQueryType.FEEDBACK_T, value: "😩" }),
            },
            {
              text: "😐",
              callback_data: JSON.stringify({ type: callBackQueryType.FEEDBACK_T, value: "😐" }),
            },
            {
              text: "🤩",
              callback_data: JSON.stringify({ type: callBackQueryType.FEEDBACK_T, value: "🤩" }),
            },
          ],
        ],
      },
    });
  } else {
    bot.editMessageText("Glad you changed your mind", {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
    });
  }
};

module.exports.sendTopAnime = async (bot, msg, subtype) => {
  const words = msg.text.trim().split(/ /g);
  const command = words.filter((w) => w.search("top") !== -1);
  const numb = words[words.indexOf(command[0]) + 1] * 1;
  const sticker = await bot.sendSticker(msg.chat.id, LOADER_S);
  if (sticker) {
    if (!words[words.indexOf(command[0]) + 1] && !(await isAdvancedCmdUsed(msg.chat.username)))
      await bot.sendMessage(
        msg.chat.id,
        `you can use this command plus an argument to choose the number of results, as in the following example which returns the top 20 upcoming
<code>${command[0]}</code> 20
  `,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Don't show again",
                  callback_data: JSON.stringify({
                    type: callBackQueryType.NO_SHOW_AGAIN_T,
                  }),
                },
              ],
            ],
          },
        }
      );
    else if (
      words[words.indexOf(command[0]) + 1] &&
      !(await isAdvancedCmdUsed(msg.chat.username))
    ) {
      advancedCmgIsUsed(msg.chat.username);
    }
    const anime = await getTopAnime(subtype);
    if (anime) bot.deleteMessage(msg.chat.id, sticker.message_id);
    anime.map((anime, i) => {
      isFavorite(msg.from.username, anime.mal_id).then((e) => {
        const favorite = e ? "⭐️" : "☆";
        const max = typeof numb === "number" && numb > 0 && numb <= 50 ? numb : 10;
        if (i < max) {
          const caption = simpleCaption(anime);
          bot
            .sendPhoto(msg.chat.id, anime.image_url, {
              caption,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: animeMoreInlineKeyboard(anime.url, anime.mal_id, favorite),
              },
            })
            .then((m) => {
              if (e) addMsgToFavorites(msg.chat.username, anime.mal_id, m.message_id);
            });
        }
      });
    });
  }
};

module.exports.sendAnime = async (bot, msg) => {
  const id = msg.text.split("_")[1];
  const w_msg = await bot.sendMessage(msg.chat.id, message.WAIT_MSG);
  const anime = await getAnimeDetail(id);
  if (anime) bot.deleteMessage(msg.chat.id, w_msg.message_id);
  const e = await isFavorite(msg.from.username, anime.mal_id);
  const favorite = e ? "⭐️" : "☆";
  const caption = simpleCaption(anime);
  bot.sendPhoto(msg.chat.id, anime.image_url, {
    caption,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: animeMoreInlineKeyboard(anime.url, anime.mal_id, favorite),
    },
  });
};

module.exports.search = async (bot, msg) => {
  const words = msg.text.split(/ /g);
  const indexOfSearch =
    words.indexOf(cmd.SEARCH_C) !== -1 ? words.indexOf(cmd.SEARCH_C) : words.indexOf("search");
  let keywords = words.slice(indexOfSearch);
  const numb = words[words.length - 1] * 1;
  let sticker;
  if (words[indexOfSearch + 1]) {
    try {
      sticker = await bot.sendSticker(msg.chat.id, LOADER_S);
      const isLimit = typeof numb === "number" && numb <= 50 && numb > 0;
      const limit = isLimit ? numb : 7;
      const results = await searchAnimeByName(keywords.join(" ").replace("search", ""));
      if (results) bot.deleteMessage(msg.chat.id, sticker.message_id);
      results.map((anime, i) => {
        isFavorite(msg.from.username, anime.mal_id).then((e) => {
          if (e) addMsgToFavorites(msg.chat.username, anime.mal_id, msg.message_id);
          const favorite = e ? "⭐️" : "☆";
          if (i < limit) {
            const caption = simpleCaption(anime);
            bot
              .sendPhoto(msg.chat.id, anime.image_url, {
                caption,
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: animeMoreInlineKeyboard(anime.url, anime.mal_id, favorite),
                },
              })
              .then((m) => {
                if (e) addMsgToFavorites(msg.chat.username, anime.mal_id, m.message_id);
              });
          }
        });
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        bot.deleteMessage(msg.chat.id, sticker.message_id);
        bot.sendMessage(
          msg.chat.id,
          `Oops❕, no result for ${keywords.join(" ").replace("search", "")}❔`
        );
      } else {
        console.log(error);
        bot.sendMessage(msg.chat.id, `Oops, error ⁉️  ${cmd.HELP_C}`);
      }
    }
  } else {
    bot.sendMessage(
      msg.chat.id,
      `Oops 🙁, please fill in the name of the anime. As in the following example :
<code>search</code> bleach or <code>${cmd.SEARCH_C}</code> bleach
\nIf you need ${cmd.HELP_C}
      `,
      { parse_mode: "HTML" }
    );
  }
};

module.exports.toggleDetails = async (bot, query) => {
  const data = JSON.parse(query.data);
  if (data.animeId) {
    const details = await getAnimeDetail(data.animeId);
    let favorite = (await isFavorite(query.message.chat.username, data.animeId)) ? "⭐️" : "☆";
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
              ? animeLessInlineKeyboard(details.url, data.animeId, favorite)
              : animeMoreInlineKeyboard(details.url, details.mal_id, favorite),
        },
      }
    );
  }
};

module.exports.toggleFavorite = async (bot, query) => {
  const data = JSON.parse(query.data);
  if (data.animeId) {
    const details = await getAnimeDetail(data.animeId);
    let favorite;
    if (data.value === "☆") {
      favorite = "⭐️";
      addFavorite(query.message.chat.username, {
        id: data.animeId,
        title: details.title,
        url: details.url,
        img: details.image_url,
        msg: [query.message.message_id],
      });
    } else {
      favorite = "☆";
      removeFavorite(query.message.chat.username, data.animeId, bot, query.message);
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
              ? animeLessInlineKeyboard(details.url, data.animeId, favorite)
              : animeMoreInlineKeyboard(details.url, details.mal_id, favorite),
        },
      }
    );
  }
};

module.exports.removeFavorite = removeFavorite;

module.exports.removeContact = removeContact;

module.exports.emptyFavorite = emptyFavorite;

module.exports.advancedCmgIsUsed = advancedCmgIsUsed;

module.exports.commandsList = commandsList;

module.exports.sayHello = sayHello;

module.exports.noUnderstand = noUnderstand;

module.exports.welcome = welcome;
