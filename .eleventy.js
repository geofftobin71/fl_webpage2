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
const site = require("./src/_data/site.js");
const slugify = require("@sindresorhus/slugify");
const countableSlugify = slugify.counter();

Settings.defaultZoneName = "Pacific/Auckland";

markdown.renderer.rules.image = function (tokens, idx, options, env, self) {
  const image_path = tokens[idx].attrs[0][1];
  const title_txt = (tokens[idx].attrs[2]) ? tokens[idx].attrs[2][1] : null;

  let caption = '';
  if(title_txt) {
    caption = '<figcaption class="caption text-center" style="margin-top:0.3em">' + markdown.utils.escapeHtml(title_txt) + '</figcaption>';
  }

  let alt = ' alt="' + self.renderInlineAsText(tokens, options, env) + '"';

  return '<figure><noscript><img ' + alt + ' src="' + site.twic_url + image_path + '" /></noscript><img class="req-js"' + alt + ' src="' + site.twic_url + image_path + '?twic=v1/output=preview" data-twic-src="image:' + image_path + '" data-twic-step="50" data-twic-bot="contain=750x750" />'
    + caption + '</figure>';
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
    if((!site.dev) && outputPath.endsWith(".html")) {
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
    return decodeURIComponent(string);
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

  eleventyConfig.addFilter("urldecode", (string) => {
    return decodeURIComponent(string);
  });

  eleventyConfig.addFilter("sortISO8601", (array) => {
    return array.sort((a, b) => {
      return (a.timestamp < b.timestamp) ? -1 : ((a.timestamp > b.timestamp) ? 1 : 0);
    });
  });

  eleventyConfig.addFilter("splitHours", (hours, index) => {
    return hours.split('-')[index].trim();
  });

  eleventyConfig.addFilter("twentyFour", (time, ampm = 'pm') => {
    let pm = (ampm == 'pm');

    if(time.trim().slice(-2).toLowerCase() == 'am') { pm = false; }
    if(time.trim().slice(-2).toLowerCase() == 'pm') { pm = true; }

    const bits = time.split(/[^0-9]/);

    let hour_num = ((bits.length > 0) && (bits[0])) ? parseInt(bits[0]) : 0;
    hour_num += ((hour_num < 12) && (pm) ? 12 : 0);

    let minute_num = ((bits.length > 1) && (bits[1])) ? parseInt(bits[1]) : 0;

    const hour = ('00' + hour_num).slice(-2);
    const minute = ('00' + minute_num).slice(-2);

    return hour + ':' + minute;
  });

  eleventyConfig.addNunjucksShortcode("twic", function(args) {
    let path = (args.path) ? args.path : "";
    let params = (args.params) ? args.params : "";
    if(args.sizes) {
      return args.sizes.map(function(size) {
        return `${site.twic_url}${path}?twic=v1/resize-max=${size}${params} ${size}w`;
      }).join(',');
    } else {
      return `${site.twic_url}${path}?twic=v1${params}`;
    }
  });

  eleventyConfig.addNunjucksAsyncShortcode("lqip", async function(args) {
    let path = (args.path) ? args.path : "";
    let params = (args.params) ? args.params : "";
    let lqip_path = `${site.twic_url}${path}?twic=v1${params}/output=preview`;
    return fetch(lqip_path)
      .then(res => res.text())
      .then(data => {
        let buff = Buffer.from(data);
        return ("data:image/svg+xml;base64," + buff.toString("base64"));
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
    let params = (args.params) ? args.params : "";
    let lqip_path = path.replace(site.match_url, site.twic_url + "/instagram").replace("?", "?twic=v1" + params + "/output=preview&");
    return fetch(lqip_path)
      .then(res => res.text())
      .then(data => {
        let buff = Buffer.from(data);
        return ("data:image/svg+xml;base64," + buff.toString("base64"));
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

    /*
    for(let i = 0; i < coll.length ; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }
    */

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
