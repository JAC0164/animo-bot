const WallpaperSchema = require('../models/wallpapers.model');
const MsgHistorySchema = require('../models/msg_history.model');
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
      bot.sendMessage(msg.chat.id, 'photo saved ✅');
    } else if (!msg.photo) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, 'only post type photo allowed ❌');
    } else if (!msg.caption) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, 'required caption ❗️');
    }
  }

  static async updateAwPost(bot, msg) {
    if (msg.photo && msg.caption) {
      const fileId = msg.photo[0].file_id;
      const fileUniqueId = msg.photo[0].file_unique_id;
      const caption = msg.caption;
      await WallpaperSchema.findOneAndUpdate({ fileUniqueId }, { caption, fileId });
      bot.sendMessage(msg.chat.id, 'photo updated ✅');
    } else if (!msg.photo) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, 'only post type photo allowed ❌');
    } else if (!msg.caption) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
      bot.sendMessage(msg.chat.id, 'required caption ❗️');
    }
  }

  static async forwardPost(bot, msg) {
    let msgHistory = null;
    if ('photo' in msg) {
      msgHistory = await bot.sendPhoto(process.env.ANIMO_CHANNEL_ID, msg.photo[0].file_id, {
        parse_mode: 'MarkdownV2',
        caption: 'caption' in msg ? msg.caption : '',
      });
    } else if ('video' in msg) {
      msgHistory = await bot.sendVideo(process.env.ANIMO_CHANNEL_ID, msg.video.file_id, {
        parse_mode: 'MarkdownV2',
        caption: 'caption' in msg ? msg.caption : '',
      });
    } else if ('document' in msg) {
      msgHistory = await bot.sendDocument(process.env.ANIMO_CHANNEL_ID, msg.document.file_id, {
        parse_mode: 'MarkdownV2',
        caption: 'caption' in msg ? msg.caption : '',
      });
    } else if ('text' in msg) {
      msgHistory = await bot.sendMessage(process.env.ANIMO_CHANNEL_ID, msg.text, {
        parse_mode: 'MarkdownV2',
        caption: 'caption' in msg ? msg.caption : '',
      });
    }
    if (msgHistory) {
      const msgString = JSON.stringify(msgHistory);
      await MsgHistorySchema.create({ msg: msgString });
    }
  }
}

module.exports = Channel;
