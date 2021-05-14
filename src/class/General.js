const UserSchema = require("../models/user.model");
const FeedbacksSchema = require("../models/feedbacks.model");
const keyboard = require("../libs/keyboard");
const InlineKeyboard = keyboard.InlineKeyboard;
const cst = require("../libs/const");
const cmd = cst.commands;
const message = cst.msg;

/**
 * Command list
 *
 * @returns string
 */
const commandsList = () => {
  return `🌿 Here is the list of available commands 🌿\n\n☘️ Simple commands \n  ${cmd.TOPUPCOMING_C} - top anime upcoming \n  ${cmd.TOPAIRING_C} - top anime tv \n  ${cmd.TOPMOVIE_C} - top anime movie \n  ${cmd.TOPTV_C} - top anime tv \n  ${cmd.TOPOVA_C} - top anime ova \n  ${cmd.TOPSPECIAL_C} - top anime special
  \n🍀 Advanced commands
  /search N
  ${cmd.TOPUPCOMING_C} X \n  ${cmd.TOPAIRING_C} X \n  ${cmd.TOPMOVIE_C} X \n  ${cmd.TOPTV_C} X \n  ${cmd.TOPOVA_C} X \n  ${cmd.TOPSPECIAL_C} X
  \nX : number of results (max 50)
N : anime name to search
  `;
};

/**
 * Welcome message
 *
 * @param {TelegramBot.Message} msg
 * @returns string
 */
const welcome = (msg) => {
  return `Hi 👋, ${msg.chat.first_name + " " + msg.chat.last_name}\n\n`;
};

/**
 * General
 */
class General {
  /**
   * Start Animo Bot
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async start(bot, msg) {
    const user = await UserSchema.findOne({ chatId: msg.chat.id });
    if (!user) {
      const newUser = new UserSchema();
      newUser.favorites = [];
      newUser.chatId = msg.chat.id;
      newUser.isAdvancedCmdUsed = false;
      await newUser.save();
    }
    bot.sendMessage(msg.chat.id, welcome(msg) + commandsList(), {
      parse_mode: "HTML",
    });
  }

  /**
   * Send Command List
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async help(bot, msg) {
    bot.sendMessage(msg.chat.id, commandsList(), {
      parse_mode: "HTML",
    });
  }

  /**
   * Stop Animo bot
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async stop(bot, msg) {
    const user = await UserSchema.findOne({ chatId: msg.chat.id });
    if (user) {
      bot.sendMessage(msg.chat.id, message.ARE_SURE_LEAVE, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: InlineKeyboard.stop,
        },
      });
    } else {
      bot.sendMessage(msg.chat.id, message.NOT_YET_REGISTERED_MSG);
    }
  }

  /**
   * Show user feedbacks
   *
   * @param {TelegramBot} bot
   * @param {TelegramBot.Message} msg
   */
  static async showFeedbacks(bot, msg) {
    const password = msg.text
      .toLowerCase()
      .replace(cmd.SHOW_FEEDBACKS_C, "")
      .trim()
      .split(" ");
    if (password && password[0] === process.env.PASS) {
      const feedbacks = await FeedbacksSchema.find();
      if (feedbacks.length > 0) {
        const weary = Math.round(
          (feedbacks.filter((f) => f.value === "😩").length * 100) / feedbacks.length
        );
        const neuter = Math.round(
          (feedbacks.filter((f) => f.value === "😐").length * 100) / feedbacks.length
        );
        const starStruck = 100 - (weary + neuter);
        bot.sendMessage(msg.chat.id, message.FEEDBACKS_MSG(weary, neuter, starStruck), {
          parse_mode: "HTML",
        });
      } else {
        bot.sendMessage(msg.chat.id, message.NO_FEEDBACKS);
      }
    } else {
      bot.sendMessage(msg.chat.id, message.TRY_AGAIN);
    }
  }

  /**
   * Check if advanced command is already use
   *
   * @param {number} chatId
   * @returns boolean
   */
  static async isAdvancedCmdUsed(chatId) {
    const user = await UserSchema.findOne({ chatId });
    if (user) return user.isAdvancedCmdUsed;
    else return false;
  }
}

module.exports = General;
