const path = require('path');
const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');

var mailGenerator = new Mailgen({
  theme: {
    path: path.resolve('contact-thankyou.ejs')
  },
  product: {
    name: 'Floriade',
    link: 'https://floriade.co.nz/'
  }
});

// Prepare email contents
var email = {
  body: {
    title: 'Thankyou for contacting Floriade',
    name: 'John Appleseed',
    intro: 'We have received your message and will endeavour to respond to your enquiry as soon as possible.'
  }
};

// Generate an HTML email with the provided contents
var emailBody = mailGenerator.generate(email);

// Generate the plaintext version of the e-mail (for clients that do not support HTML)
var emailText = mailGenerator.generatePlaintext(email);

// Optionally, preview the generated HTML e-mail by writing it to a local file
require('fs').writeFileSync('preview.html', emailBody, 'utf8');
// require('fs').writeFileSync('preview.txt', emailText, 'utf8');

/*
var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "ba2cc93943e6dc",
    pass: "01a7c7d695af91"
  }
});

transporter.sendMail({
  from: 'no-reply@mailgen.js',
  to: 'geofftobin71@gmail.com',
  subject: 'Floriade Receipt',
  html: emailBody,
  text: emailText,
}, function (err) {
  if (err) return console.log(err);
  console.log('Message sent successfully.');
});

*/
