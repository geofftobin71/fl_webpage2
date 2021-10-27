const path = require('path');
const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');

// Configure mailgen by setting a theme and your product info
var mailGenerator = new Mailgen({
  theme: {
    path: path.resolve('theme.ejs')
  },
  product: {
    name: 'Floriade',
    link: 'https://floriade.co.nz/',
    logo: 'https://floriade.co.nz/icons/floriade-icon-round-240.png',
    logoHeight: '120px'
  }
});

// Prepare email contents
var email = {
  body: {
    title: 'Floriade Receipt',
    name: 'John Appleseed',
    intro: 'Your order has been processed successfully.',
    table: {
      data: [
        {
          item: 'Event-driven I/O server-side JavaScript environment based on V8.',
          price: '$10.99'
        },
        {
          item: 'Programmatically create beautiful e-mails using plain old JavaScript.',
          price: '$1.99'
        }
      ],
      columns: {
        // Optionally, customize the column widths
        customWidth: {
          price: '15%'
        },
        // Optionally, change column text alignment
        customAlignment: {
          price: 'right'
        }
      }
    },
    action: {
      instructions: 'You can check the status of your order and more in your dashboard:',
      button: {
        color: '#3869D4',
        text: 'Go to Dashboard',
        link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
      }
    },
    outro: 'We thank you for your purchase.'
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
