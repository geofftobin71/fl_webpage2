const { Settings, DateTime } = require("luxon"); 
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const svgContents = require("eleventy-plugin-svg-contents");
const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-js");
const jsonminify = require("jsonminify");
const markdown = require("markdown-it")({ html: true }).disable('code');
const fs = require("fs");
const site = require('./src/_data/site.js');

Settings.defaultZoneName = "Pacific/Auckland";

/*
markdown.renderer.rules.image = function (tokens, idx, options, env, self) {
  const srcfilename = tokens[idx].attrs[0][1];
  const title_txt = (tokens[idx].attrs[2]) ? tokens[idx].attrs[2][1] : null;
  const public_id = srcfilename.replace('https://res.cloudinary.com/floriade/image/upload', '').replace(/\/v[0-9]+/, '').replace(/\.[a-zA-Z0-9]+$/, '').replace(/^\//,'');

  let caption = '';
  if(title_txt) {
    caption = '<figcaption class="caption text-center" style="margin-top:0.3em">' + markdown.utils.escapeHtml(title_txt) + '</figcaption>';
  }

  let alt = ' alt="' + self.renderInlineAsText(tokens, options, env) + '"';

  if(alt == ' alt=""') {
    alt = ' alt="Flowers by Floriade"';
  }

  let transforms = ",c_fill,ar_1,q_auto,f_auto,g_auto:subject/";
  let src = site.cloudinary_url + '/w_900' + transforms + public_id;

  let srcset = ' data-srcset="';
  let first = true;
  image_sizes.forEach(size => {
    if(!first) { srcset += ','; }
    srcset += site.cloudinary_url + '/w_' + size + transforms + public_id + ' ' + size + 'w';
    first = false;
  });
  srcset += '"';

  let sizes = ' sizes="(min-width:1200px) 75ch, (min-width:65ch) 65ch, 100vw"';

  let lqip_path = site.cloudinary_url + "/c_fill,w_32,h_32,q_auto,f_jpg,g_auto:subject,e_blur:200/" + public_id;

  return '<figure><noscript><img class="round shadow" width="1200" height="1200"' + alt + ' src="' + src + '" style="background-image:url(' + lqip_path + ')" loading="lazy" decoding="async" /></noscript><img class="round shadow" width="1200" height="1200"' + alt + ' src="' + site.transgif + '"' + srcset + sizes + 'data-src="' + src + '" style="background-image:url(' + lqip_path + ')" loading="lazy" decoding="async" />'
    + caption + '</figure>';
}
*/

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

  eleventyConfig.addFilter("cssmin", (code) => {
    if(site.dev) { return code; }

    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addFilter("jsmin", (code) => {
    if(site.dev) { return code; }

    let minified = UglifyJS.minify(code);
    if( minified.error ) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  eleventyConfig.addFilter("jsonmin", (code) => {
    if(site.dev) { return code; }

    return jsonminify(code);
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-LL-dd');
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

    for(let i = 0; i < coll.length ; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return coll;
  });

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: (err, bs) => {

        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync('dist/404.html');
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
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: "src",
      output: "dist"
    },
    passthroughFileCopy:true
  };
};
