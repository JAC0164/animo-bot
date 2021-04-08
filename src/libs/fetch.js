const axios = require("axios").default;

module.exports.getTopAnime = async (type) => {
  const url = `https://api.jikan.moe/v3/top/anime/1/${type}`;
  const res = await axios.get(url);
  const data = await res.data;
  return data.top;
};

module.exports.getAnimeDetail = async (id) => {
  const url = `https://api.jikan.moe/v3/anime/${id}`;
  const res = await axios.get(url);
  const data = await res.data;
  return data;
};

module.exports.searchAnimeByName = async (name) => {
  const url = `https://api.jikan.moe/v3/search/anime?q=${name}&page=1`;
  const res = await axios.get(url);
  const data = await res.data;
  return data.results;
};
