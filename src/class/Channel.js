const WallpaperSchema = require('../models/wallpapers.model');
const MsgHistorySchema = require('../models/msg_history.model');
const { getFilePath, downloader } = require('../libs/fetch');
const AnimeModel = require('../models/anime.model');
const constants = require('../libs/const');
const const_msg = constants.msg;
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
    if (msg.text && msg.text.startsWith('#newAnime')) {
      const anime = (await AnimeModel.find().exec())[0];
      if (anime)
        return bot.sendMessage(
          msg.chat.id,
          `L'anime ${anime.name} est cours de transfère, #fin pour le supprimer`
        );
      const name = msg.text.trim().split(' ').slice(1).join(' ');
      if (!name) return bot.sendMessage(msg.chat.id, 'Syntax invalide ❗️, réessayer.');
      if (name.length < 4)
        return bot.sendMessage(msg.chat.id, 'Nom de trop court ❗️, réessayer.');
      const doc = await AnimeModel.create({ name });
      bot.sendMessage(msg.chat.id, const_msg.FORWARD_SAVED_MSG(doc.name));
      return;
    }
    if (msg.text && msg.text.startsWith('#fin')) {
      const anime = (await AnimeModel.find().exec())[0];
      if (!anime) return;
      await AnimeModel.findByIdAndRemove(anime._id);
      return bot.sendMessage(msg.chat.id, `Merci pour l'anime ${anime.name}`);
    }
    if ('text' in msg) return;
    if ('photo' in msg) {
      msgHistory = await bot.sendPhoto(process.env.ANIMO_CHANNEL_ID, msg.photo[0].file_id, {
        caption: animeName,
      });
      return;
    } else if ('video' in msg) {
      msgHistory = await bot.sendVideo(process.env.ANIMO_CHANNEL_ID, msg.video.file_id, {
        caption: animeName,
      });
    } else if ('document' in msg) {
      msgHistory = await bot.sendDocument(process.env.ANIMO_CHANNEL_ID, msg.document.file_id, {
        caption: animeName,
      });
    }
    if (msgHistory) {
      const msgString = JSON.stringify(msgHistory);
      await MsgHistorySchema.create({ msg: msgString });
    }
  }
}

/* let msgHistory = null;
    if (msg.text && msg.text.startsWith('#newAnime')) {
      const anime = (await AnimeModel.find().exec())[0];
      if (anime)
        return bot.sendMessage(
          msg.chat.id,
          `L'anime ${anime.name} est cours de transfère, #fin pour le supprimer`
        );
      const name = msg.text.trim().split(' ').slice(1).join(' ');
      if (!name) return bot.sendMessage(msg.chat.id, 'Syntax invalide ❗️, réessayer.');
      if (name.length < 4)
        return bot.sendMessage(msg.chat.id, 'Nom de trop court ❗️, réessayer.');
      const doc = await AnimeModel.create({ name });
      bot.sendMessage(msg.chat.id, const_msg.FORWARD_SAVED_MSG(doc.name));
      return;
    }
    if (msg.text && msg.text.startsWith('#fin')) {
      const anime = (await AnimeModel.find().exec())[0];
      if (!anime) return;
      await AnimeModel.findByIdAndRemove(anime._id);
      return bot.sendMessage(msg.chat.id, `Merci pour l'anime ${anime.name}`);
    }
    if ('text' in msg) return;
    const animeName = (await AnimeModel.find().exec())[0]?.name;
    if (!animeName) {
      return bot.sendMessage(
        msg.chat.id,
        'Veiller définir d abord le nom de l anime avec /newAnime + nom de l anime'
      );
    }
    const fileName = animeName ? `@AnimoCanal - ${animeName}` : '@AnimoCanal';
    if ('photo' in msg) {
      msgHistory = await bot.sendPhoto(process.env.ANIMO_CHANNEL_ID, msg.photo[0].file_id, {
        caption: animeName,
      });
      return;
    }
    
    const file_url = await getFilePath(bot, msg);
    const file = await downloader(file_url, fileName);
    if ('video' in msg) {
      msgHistory = await bot.sendVideo(process.env.ANIMO_CHANNEL_ID, file, {
        caption: animeName,
      });
    } else if ('document' in msg) {
      msgHistory = await bot.sendDocument(process.env.ANIMO_CHANNEL_ID, file, {
        caption: animeName,
      });
    }
    if (msgHistory) {
      const msgString = JSON.stringify(msgHistory);
      await MsgHistorySchema.create({ msg: msgString });
    }
  } */

module.exports = Channel;
