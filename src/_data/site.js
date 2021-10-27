const local_url = "http://168.138.10.72:8080";

const site_data = require("./site_data.json");

module.exports = {
  url: process.env.URL || local_url,
  dev: ((process.env.URL || local_url) === local_url),
  name: "Floriade",
  tagline: "fresh & dried flowers for any occasion",
  tagline_html: "fresh&nbsp;&amp;&nbsp;dried&nbsp;flowers for&nbsp;any&nbsp;occasion",
  description: site_data.description,
  alt: "Flowers by Floriade",
  logo: "/icons/floriade-icon-round-512.png",
  social_image: "/images/floriade-socialmedia-image.jpg",
  header_image: site_data.header_image,
  phone: site_data.phone,
  phone_intl: site_data.phone.replace("0", "+64").replaceAll(" ", ""),
  address: site_data.address,
  address_locality: site_data.address_locality,
  address_region: site_data.address_region,
  address_postcode: site_data.address_postcode,
  email: "flowers@floriade.co.nz",
  email_obf: "&#x66;&#108;&#x6f;&#119;&#101;&#x72;&#x73;&#64;&#102;&#108;&#x6f;&#x72;&#105;&#97;&#x64;&#101;&#x2e;&#99;&#111;&#46;&#110;&#x7a;",
  mailto_obf: "&#x6d;&#97;&#x69;&#108;&#116;&#111;&#x3a;&#x66;&#108;&#111;&#x77;&#101;&#114;&#115;&#x40;&#102;&#x6c;&#x6f;&#114;&#x69;&#x61;&#x64;&#101;&#x2e;&#x63;&#x6f;&#x2e;&#110;&#122;",
  facebook: "https://www.facebook.com/floriadewellingtonnz/",
  instagram: "https://instagram.com/floriade_wellington",
  pinterest: "https://nz.pinterest.com/floriade0826",
  google_page: "https://g.page/r/Cdd6u_swEkZmEAo",
  google_review: "https://g.page/r/Cdd6u_swEkZmEAo/review",
  google_maps: "https://goo.gl/maps/jGdMssVmNamjZXA4A",
  twic_url: "https://ay65paiy.twic.pics",
  match_url: /^https?:\/\/[^\s$.?#].[^\s\/]*/,
  transgif: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
};
