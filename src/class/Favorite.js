const UserSchema = require('../models/user.model');

/**
 * Favorite
 */
class Favorite {
  /**
   *  Add anime to favorites
   *
   * @param {TelegramBot.CallbackQuery} query
   * @param {User.favorite} favorite
   */
  static async addFavorite(query, favorite) {
    const chatId = query.message.chat.id;
    const user = await UserSchema.findOne({ chatId });
    if (user) {
      const isFavorite =
        user.favorites.filter((f) => parseInt(favorite.id) === f.id).length > 0;
      if (!isFavorite) {
        user.favorites.push(favorite);
        await UserSchema.updateOne({ chatId }, { favorites: user.favorites });
      }
    } else {
      new UserSchema({
        favorites: [favorite],
        chatId,
        isAdvancedCmdUsed: false,
      }).save();
    }
  }

  /**
   * Delete anime to favorites
   *
   * @param {number} chatId
   * @param {number} animeId
   */
  static async deleteFavorite(chatId, animeId) {
    const user = await UserSchema.findOne({ chatId });
    if (user) {
      const newFavorites = user.favorites.filter((f) => f.id !== parseInt(animeId));
      await UserSchema.updateOne({ chatId }, { favorites: newFavorites });
    }
  }

  /**
   * Empty favorite list
   *
   * @param {number} chatId
   */
  static async emptyFavorite(chatId) {
    const user = await UserSchema.findOne({ chatId });
    if (user) {
      await UserSchema.updateOne({ chatId }, { favorites: [] });
    }
  }

  /**
   * Check if anime is a favorite
   *
   * @param {number} chatId
   * @param {number} animeId
   * @returns Boolean
   */
  static async isFavorite(chatId, animeId) {
    const user = await UserSchema.findOne({ chatId });
    if (user) return user.favorites.filter((f) => f.id === parseInt(animeId)).length === 1;
    else return false;
  }
}

module.exports = Favorite;
