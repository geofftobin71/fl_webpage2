require("dotenv").config();

const { Settings, DateTime } = require("luxon"); 
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const svgContents = require("eleventy-plugin-svg-contents");
const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-js");
const jsonminify = require("jsonminify");
const markdown = require("markdown-it")({ html: true }).disable("code");
const fetch = require("node-fetch");
const fs = require("fs");
const slugify = require("@sindresorhus/slugify");
const countableSlugify = slugify.counter();
const crypto = require('crypto');

const site = require("./src/_data/site.js");

Settings.defaultZoneName = "Pacific/Auckland";

markdown.renderer.rules.image = function (tokens, idx, options, env, self) {
  const image_url = tokens[idx].attrs[0][1];
  const image_path = image_url.replace(site.cloudinary_url, '');
  const alt_txt = self.renderInlineAsText(tokens, options, env);
  const title_txt = (tokens[idx].attrs[2]) ? tokens[idx].attrs[2][1] : null;

  let caption = '';
  if(title_txt) {
    caption = '<figcaption class="caption">' + markdown.utils.escapeHtml(title_txt) + '</figcaption>';
  }

  const image_info = require("./_cache/image-info.json");
  const info = image_info.find(element => element.url === image_url);

  if(info && info.photographer_name) {
    if(info && info.photographer_url) {
      caption += '<figcaption class="caption small">Photo credit : <a href="' + info.photographer_url + '" target="_blank" rel="noopener">' + markdown.utils.escapeHtml(info.photographer_name) + '</a></figcaption>';
    } else {
      caption += '<figcaption class="caption small">Photo credit : ' + markdown.utils.escapeHtml(info.photographer_name) + '</figcaption>';
    }
  }

  let alt = ' alt="' + alt_txt + '"';

  return '<figure class="vertical center"><div style="background-image:url(' + site.twic_url + image_path + '?twic=v1/output=preview)"><noscript><img ' + alt + ' src="' + site.twic_url + image_path + '?twic=v1/resize=800" /></noscript><img class="req-js"' + alt + ' src="' + site.transgif + '" data-twic-src="image:' + image_path + '" data-twic-step="50" data-twic-bot="contain=800x800" /></div>'
    + caption + '</figure>';
}

function uniqueId(length) {
  const buf = crypto.randomBytes(length/2);
  return buf.toString('hex');
}

module.exports = function (eleventyConfig) {

  eleventyConfig.setLibrary("md", markdown);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addPlugin(svgContents);

  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: site.url,
    },
  });

  eleventyConfig.addPassthroughCopy({"./src/favicon/*.ico" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.png" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.svg" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.xml" : "/"});
  eleventyConfig.addPassthroughCopy({"./src/favicon/*.webmanifest" : "/"});
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/icons");
  eleventyConfig.addPassthroughCopy("./admin");

  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if((!site.dev) && outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addFilter("slugify", function (str) {
    return slugify(str);
  });

  eleventyConfig.addFilter("slugSuffix", (string) => {
    let number = string.split('-').pop();
    if(isNaN(number)) {
      return '';
    } else {
      return '-' + number;
    }
  });

  eleventyConfig.addFilter("cssmin", (code) => {
    if(site.dev) { return code; }

    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addFilter("jsmin", (code) => {
    if(site.dev) { return code; }

    let minified = UglifyJS.minify(code);
    if( minified.error ) {
      console.error("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  eleventyConfig.addFilter("jsonmin", (code) => {
    if(site.dev) { return code; }

    return jsonminify(code);
  });

  eleventyConfig.addFilter("addNbsp", (str) => {
    if (!str) {
      return;
    }
    let title = str.replace(/((.*)\s(.*))$/g, "$2&nbsp;$3");
    title = title.replace(/"(.*)"/g, '\\"$1\\"');
    return title;
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if(!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addFilter("urldecode", (string) => {
    return decodeURIComponent(string.replace(/\+/g, ' '));
  });

  eleventyConfig.addFilter("iconTextButton", (svg) => {
    return (svg) ? svg.replace('<svg ', '<svg class="button-icon" aria-hidden="true" focusable="false" ') : '';
  });

  eleventyConfig.addFilter("iconButton", (svg) => {
    return (svg) ? svg.replace('<svg ', '<svg class="icon-button-icon" aria-hidden="true" focusable="false" ') : '';
  });

  // Convert uppercase to hyphen-lowercase : fooBar => foo-bar
  eleventyConfig.addFilter("hyphenate", (word) => {
    function upperToHyphenLower(match, offset, string) {
      return (offset > 0 ? '-' : '') + match.toLowerCase();
    }
    return word.replace(/[A-Z]/g, upperToHyphenLower);
  });

  eleventyConfig.addFilter("removeEmpty", (array) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].key.length) { 
        filtered[filtered.length] = array[i]; 
      }
    }
    return filtered;
  });

  eleventyConfig.addFilter("pronoun", (string) => {
    return string.replaceAll(/\si\s/ig, "<span style='text-transform:uppercase'> I </span>");
  });

  eleventyConfig.addFilter("sortISO8601", (array) => {
    return array.sort((a, b) => {
      return (a.timestamp < b.timestamp) ? -1 : ((a.timestamp > b.timestamp) ? 1 : 0);
    });
  });

  eleventyConfig.addFilter("twelveHourTime", (string) => {
    return DateTime.fromFormat(string, "HH:mm").toFormat("h:mma");
  });

  eleventyConfig.addFilter("findSpecialDay", (array, date) => {
    return array.find(element => element.date === date);
  });

  eleventyConfig.addFilter("findPhotographer", (array, name) => {
    return array.find(element => element.name === name);
  });

  eleventyConfig.addFilter("findImage", (array, url) => {
    return array.find(element => element.url === url);
  });

  eleventyConfig.addFilter("findFolder", (array, folder) => {
    return array.filter(element => element.folder === folder);
  });

  eleventyConfig.addFilter("shuffle", (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  });

  eleventyConfig.addFilter("removeLongReviews", (array, limit) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].review.length <= limit) { filtered[filtered.length] = array[i]; }
    }
    return filtered;
  });

  eleventyConfig.addFilter("filterWeddingReviews", (array, wedding) => {
    let filtered = [];
    for (let i = 0; i < array.length; ++i) {
      if(array[i].wedding == wedding) { filtered[filtered.length] = array[i]; }
    }
    return filtered;
  });

  eleventyConfig.addFilter("uniqueId", (length) => {
    return uniqueId(length);
  });

  eleventyConfig.addNunjucksShortcode("youtube", function(id) {
    return `<lite-youtube videoid="${id}" style="background-image: url('https://i.ytimg.com/vi/${id}/maxresdefault.jpg');">
      <button type="button" class="lty-playbtn">
      <span class="lyt-visually-hidden">Play Video</span>
      </button>
      </lite-youtube>
      <noscript style="display:block">
      <a style="display:block;width:100%;max-width:720px;margin:0 auto" href="https://youtu.be/${id}" target="_blank" rel="noopener">
      <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" alt="YouTube video" width="1280" height="720">
      <p class="caption">Click to Play</p>
      </a>
      <style>lite-youtube{display:none}</style>
      </noscript>`;
  });

  eleventyConfig.addNunjucksShortcode("twic", function(args) {
    let path = (args.path) ? args.path : "";
    path = path.replace(site.cloudinary_url,"");

    let params = (args.params) ? args.params : "";
    if(args.sizes) {
      return args.sizes.map(function(size) {
        return `${site.twic_url}${path}?twic=v1/resize-max=${size}${params} ${size}w`;
      }).join(',');
    } else {
      return `${site.twic_url}${path}?twic=v1${params}`;
    }
  });

  eleventyConfig.addNunjucksShortcode("twic_dyn", function(args) {
    let path = (args.path) ? args.path : "";
    path = path.replace(site.cloudinary_url,"");

    return `image:${path}`;
  });

  eleventyConfig.addNunjucksAsyncShortcode("lqip", async function(args) {
    let path = (args.path) ? args.path : "";

    const image_info = require("./_cache/image-info.json");
    const info = image_info.find(element => element.url === path);

    let cachefile;

    if(info && info.id) {
      cachefile = '_cache/lqip_' + info.id;

      if(fs.existsSync(cachefile)) {
        // console.log('Using ' + cachefile + ' cache');
        const cache = fs.readFileSync(cachefile);
        return cache;
      }
    }

    path = path.replace(site.cloudinary_url,"");

    const params = (args.params) ? args.params : "";
    const lqip_path = `${site.twic_url}${path}?twic=v1${params}/output=preview`;

    return fetch(lqip_path)
      .then(res => res.text())
      .then(data => {
        const lqip = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);

        if(cachefile) { fs.writeFileSync(cachefile, lqip); }

        return (lqip);
      })
      .catch(err => {
        console.error("LQIP error: ", err);
        return (lqip_path);
      });
  });

  eleventyConfig.addNunjucksShortcode("insta_twic", function(args) {
    let path = (args.path) ? args.path : "";
    let params = (args.params) ? args.params : "";
    if(args.sizes) {
      return args.sizes.map(function(size) {
        return path.replace(site.match_url, site.twic_url + "/instagram").replace("?", "?twic=v1/resize-max=" + size + params + "&").concat(" " + size + "w");
      }).join(',');
    } else {
      return path.replace(site.match_url, site.twic_url + "/instagram").replace("?", "?twic=v1" + params + "&");
    }
  });

  eleventyConfig.addNunjucksAsyncShortcode("insta_lqip", async function(args) {
    let path = (args.path) ? args.path : "";

    const image_info = require("./_cache/instagram-gallery.json");
    const info = image_info.find(element => element.media_url === path);

    let cachefile;

    if(info && info.id) {
      cachefile = '_cache/lqip_' + info.id;

      if(fs.existsSync(cachefile)) {
        // console.log('Using ' + cachefile + ' cache');
        const cache = fs.readFileSync(cachefile);
        return cache;
      }
    }

    const params = (args.params) ? args.params : "";
    const lqip_path = path.replace(site.match_url, site.twic_url + "/instagram").replace("?", "?twic=v1" + params + "/output=preview&");

    return fetch(lqip_path)
      .then(res => res.text())
      .then(data => {
        const lqip = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);

        if(cachefile) { fs.writeFileSync(cachefile, lqip); }

        return (lqip);
      })
      .catch(err => {
        console.error("LQIP error: ", err);
        return (lqip_path);
      });
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addAsyncShortcode("markdown", async (content) => {
    const md = await markdown.render(content);
    return md;
  });

  eleventyConfig.addCollection("blog", (collection) => {
    const today = DateTime.local().set({hours:0,minutes:0,seconds:0,milliseconds:0});
    const livePosts = (p) => { 
      const post_date = DateTime.fromJSDate(p.date).set({hours:0,minutes:0,seconds:0,milliseconds:0});
      return (post_date <= today) && (!p.data.draft);
    }

    let coll = collection.getFilteredByGlob("./src/blog/*.md").filter(livePosts).reverse();

    return coll;
  });

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: (err, bs) => {

        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync("dist/404.html");
          // Provides the 404 content without redirect.
          res.write(content_404);
          // Add 404 http status code in request header.
          // res.writeHead(404, { "Content-Type": "text/html" });
          res.writeHead(404);
          res.end();
        });
      }
    }
  });

  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist"
    },
    passthroughFileCopy:true
  };
};
