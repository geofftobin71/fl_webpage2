const fetch = require('node-fetch');
const fs = require('fs');
const site = require('./site.js');

module.exports = function() {

  if(!fs.existsSync('_cache')) { fs.mkdirSync('_cache', true); }

  const cachefile = '_cache/instagram-gallery.json';

  if(site.dev && fs.existsSync(cachefile)) {
    console.log('Using instagram-gallery cache');
    const cache = require('../../' + cachefile);
    return cache;
  }

  fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + process.env.INSTAGRAM_TOKEN);
  /*
  .then(res => res.json())
  .then(json => console.log(json));
  */

  return fetch('https://graph.instagram.com/me/media?fields=id,media_url,thumbnail_url,caption,timestamp&access_token=' + process.env.INSTAGRAM_TOKEN)
    .then(res => res.json())
    .then(json => {
      fs.writeFileSync(cachefile, JSON.stringify(json.data, null, 2));
      return json.data;
    });
};

