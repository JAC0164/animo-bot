const WallpaperSchema = require("../models/wallpapers.model");

/**
 * Channel
 */
class Channel {
  static async saveAwPost(bot, msg) {
    if (msg.photo && msg.caption) {
      const fileId = msg.photo[0].file_id;
      const fileUniqueId = msg.photo[0].file_unique_id;
      const caption = msg.caption;
      await WallpaperSchema.create({ fileId, caption, fileUniqueId });
      bot.sendMessage(msg.chat.id, "photo saved ✅");
    } else if (!msg.photo) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, "only post type photo allowed ❌");
    } else if (!msg.caption) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, "required caption ❗️");
    }
  }

  static async updateAwPost(bot, msg) {
    if (msg.photo && msg.caption) {
      const fileId = msg.photo[0].file_id;
      const fileUniqueId = msg.photo[0].file_unique_id;
      const caption = msg.caption;
      await WallpaperSchema.findOneAndUpdate({ fileUniqueId }, { caption, fileId });
      bot.sendMessage(msg.chat.id, "photo updated ✅");
    } else if (!msg.photo) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, "only post type photo allowed ❌");
    } else if (!msg.caption) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, "required caption ❗️");
    }
  }
}

module.exports = Channel;
