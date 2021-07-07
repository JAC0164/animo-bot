const down = (url) => {
  require('https').get(url, (res) => {
    if (res.headers.location !== '' && res.headers.location) {
      down(res.headers.location);
    }
    console.log(res.statusCode);
  });
};

down(
  'https://dl.dropbox.com/s/59z2hl6vuoh2j8i/%40Canalmanga_anime%20Fire%20Force%20S01%20Ep03.mp4'
);
