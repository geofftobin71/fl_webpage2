const local_url = "http://168.138.10.72:8080";

module.exports = {
  url: process.env.URL || local_url,
  dev: ((process.env.URL || local_url) === local_url),
  name: "Floriade",
  tagline: "fresh & dried flowers for any occasion",
  tagline_html: "fresh&nbsp;&amp;&nbsp;dried&nbsp;flowers for&nbsp;any&nbsp;occasion",
  description: "Fresh & dried flowers for any occasion. Unique designs that stand out from the everyday using unusual flowers and foliage as well as traditional favourites.",
  alt: "Flowers by Floriade",
  logo: "/images/floriade-icon-round-512.png",
  social_image: "/images/floriade-socialmedia-image.jpg",
  phone: "04 213 7952",
  phone_intl: "+6442137952",
  address: "18 Cambridge Terrace",
  address_locality: "Te Aro",
  address_region: "Wellington",
  address_postcode: "6011",
  email: "flowers@floriade.co.nz",
  email_obf: "&#x66;&#108;&#x6f;&#119;&#101;&#x72;&#x73;&#64;&#102;&#108;&#x6f;&#x72;&#105;&#97;&#x64;&#101;&#x2e;&#99;&#111;&#46;&#110;&#x7a;",
  mailto_obf: "&#x6d;&#97;&#x69;&#108;&#116;&#111;&#x3a;&#x66;&#108;&#111;&#x77;&#101;&#114;&#115;&#x40;&#102;&#x6c;&#x6f;&#114;&#x69;&#x61;&#x64;&#101;&#x2e;&#x63;&#x6f;&#x2e;&#110;&#122;",
  facebook: "https://www.facebook.com/floriadewellingtonnz/",
  instagram: "https://instagram.com/floriade_wellington",
  pinterest: "https://nz.pinterest.com/floriade0826",
  google_page: "https://local.google.com/place?id=ChIJ6z8ye22vOG0R13q7-zASRmY&use=srp&hl=en",
  google_review: "https://search.google.com/local/writereview?placeid=ChIJ6z8ye22vOG0R13q7-zASRmY",
  google_maps: "https://goo.gl/maps/jGdMssVmNamjZXA4A",
  transgif: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
};
