const axios = require("axios").default;

/**
 *  Fetch
 */
class Fetch {
  static jikanBaseUrl = "https://api.jikan.moe/v3/";

  /**
   * Fetch Top Anime
   *
   * @param {String} type
   * @returns Array
   */
  static async getTopAnime(type) {
    const url = Fetch.jikanBaseUrl + "top/anime/1/" + type;
    const res = await axios.get(url);
    const data = await res.data;
    return data.top;
  }

  /**
   * Fetch Anime Detail
   *
   * @param {number} id
   * @returns Array
   */
  static async getAnimeDetail(id) {
    const url = Fetch.jikanBaseUrl + "anime/" + id;
    const res = await axios.get(url);
    const data = await res.data;
    return data;
  }

  /**
   * Search Anime By Name
   *
   * @param {String} name
   * @returns Array
   */
  static async searchAnimeByName(name) {
    const url = Fetch.jikanBaseUrl + `search/anime?q=${name}&page=1`;
    const res = await axios.get(url);
    const data = await res.data;
    return data.results;
  }

  /**
   * Anime quote
   *
   * @returns Array
   */
  static async animeQuote() {
    const res = await axios.get("https://animechan.vercel.app/api/random");
    const quote = await res.data;
    return quote;
  }
}

module.exports = Fetch;
