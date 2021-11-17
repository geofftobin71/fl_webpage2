require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const photographers_data = require('./photographers.json').photographers;
const site = require('./site.js');

module.exports = (async function() {

  if(!fs.existsSync('_cache')) { fs.mkdirSync('_cache', true); }

  const cachefile = '_cache/image-info.json';

  if(site.dev && fs.existsSync(cachefile)) {
    console.log('Using image-info cache');
    const cache = require('../../' + cachefile);
    return cache;
  }

  const metadata = await cloudinary.api.metadata_field_by_field_id('photographer');
  const photographers_metadata = metadata.datasource.values;

  var resources = [];
  var image_info = [];

  var result = await cloudinary.search.with_field('metadata').max_results(500).execute();
  resources = resources.concat(result.resources);

  while(result.next_cursor) {
    result = await cloudinary.search.with_field('metadata').max_results(500).next_cursor(result.next_cursor).execute();
    resources = resources.concat(result.resources);
  }

  resources.forEach(image => {

    let item = {};

    item.id = image.asset_id;
    item.url = image.secure_url;
    item.folder = image.folder;
    item.aspect_ratio = image.aspect_ratio;

    if(image.metadata && image.metadata.photographer) {
      const photographer_metadata = photographers_metadata.find(element => element.external_id === image.metadata.photographer);
      if(photographer_metadata) {
        const photographer_name = photographer_metadata.value;

        item.photographer_name = photographer_name;

        const photographer_data = photographers_data.find(element => element.name === photographer_name);
        if(photographer_data) {
          const photographer_url = photographer_data.webpage;

          item.photographer_url = photographer_url;
        }
      }
    }

    image_info.push(item);
  });

  // console.log(JSON.stringify(resources,null,2));
  // console.log(JSON.stringify(image_info,null,2));

  console.log('Caching image-info cache');

  fs.writeFileSync(cachefile, JSON.stringify(image_info, null, 2));

  return image_info;

})();
