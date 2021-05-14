const Fetch = require("./Fetch");
const UserSchema = require("../models/user.model");
const sticker = require("../libs/const").sticker;

/**
 *  Notify
 */
class Notify {
  quoteIntervalTime = 1000 * 60 * 60 * 5; // 5h
  quoteInterval;
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Send anime quotes
   */
  async NotifyQuote() {
    const quote = await Fetch.animeQuote();
    const users = await UserSchema.find({});
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      this.bot.sendSticker(user.chatId, sticker.quote);
    }
    setTimeout(() => {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        this.bot.sendMessage(
          user.chatId,
          `<i>${quote.quote}</i> \n\n<b>${quote.character}</b> - ${quote.anime}`,
          {
            parse_mode: "HTML",
          }
        );
      }
    }, 1000);
  }

  /**
   * Start notify
   */
  async start() {
    // Quotes
    setInterval(() => {
      this.quoteInterval = this.NotifyQuote().catch((err) => console.log(err));
    }, this.quoteIntervalTime);
  }
}

module.exports = Notify;
