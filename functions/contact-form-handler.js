const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const juice = require('juice');
const fs = require('fs');

function escape(htmlStr) {
  return htmlStr.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");        
}

exports.handler = (event, context, callback) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    });
  }

  let body = JSON.parse(event.body)

  // console.log(body);

  const name = body.name.trim();
  const email = body.email.trim();
  const message = body.message.trim();

  // Bail if name is missing
  if(!name) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: 'missing name'
      })
    })
  }

  // Bail if email is missing
  if(!email) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: 'missing email'
      })
    })
  }

  // Bail if message is missing
  if(!message) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: 'missing message'
      })
    })
  }

  // Bail if password is filled in (honeypot)
  if(body.password) {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({})
    })
  }

  fetch('https://www.google.com/recaptcha/api/siteverify?secret=' + process.env.RECAPTCHA_SECRET_KEY + '&response=' + body.gRecaptchaResponse, { method: 'post' })
    .then(res => res.json())
    .then(json => {
      // console.log(json);

      if((json.success) && (json.action === 'contactform') && (Number(json.score) > 0.5)) {

        const thankyou_html_template = fs.readFileSync('email/contact-thankyou.html', 'utf8');

        let thankyou_html_body = thankyou_html_template;
        thankyou_html_body = thankyou_html_body.replace('%email_heading%', escape(body.heading));
        thankyou_html_body = thankyou_html_body.replace('%name%', escape(name));
        thankyou_html_body = thankyou_html_body.replace('%message%', escape(message));
        thankyou_html_body = juice(thankyou_html_body);

        const thankyou_txt_template = fs.readFileSync('email/contact-thankyou.txt', 'utf8');

        let thankyou_txt_body = thankyou_txt_template;
        thankyou_txt_body = thankyou_txt_body.replace('%email_heading%', body.heading);
        thankyou_txt_body = thankyou_txt_body.replace('%name%', name);
        thankyou_txt_body = thankyou_txt_body.replace('%message%', message);

        const message_html_template = fs.readFileSync('email/contact-message.html', 'utf8');

        let message_html_body = message_html_template;
        message_html_body = message_html_body.replace('%name%', escape(name));
        message_html_body = message_html_body.replace('%message%', escape(message));
        message_html_body = juice(message_html_body);

        const message_txt_template = fs.readFileSync('email/contact-message.txt', 'utf8');

        let message_txt_body = message_txt_template;
        message_txt_body = message_txt_body.replace('%name%', name);
        message_txt_body = message_txt_body.replace('%message%', message);

        var transporter = nodemailer.createTransport({
          host: "smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: "ba2cc93943e6dc",
            pass: "01a7c7d695af91"
          }
        });

        // Send Confirmation Email

        transporter.sendMail({
          from: '"Floriade" <no-reply@mailgen.js>',
          to: `"${name}" <${email}>`,
          subject: body.subject,
          html: thankyou_html_body,
          text: thankyou_txt_body,
        }, function (err) {
          if(err) {
            console.error(err);

            return callback(null, {
              statusCode: 400,
              body: JSON.stringify({
                error: err
              })
            })
          }
        });

        // Send Message

        transporter.sendMail({
          from: `"${name}" <${email}>`,
          to: '"Floriade" <no-reply@mailgen.js>',
          subject: body.subject,
          html: message_html_body,
          text: message_txt_body,
        }, function (err) {
          if(err) {
            console.error(err);

            return callback(null, {
              statusCode: 400,
              body: JSON.stringify({
                error: err
              })
            })
          }
        });

        // console.log('Message sent successfully.');

        return callback(null, {
          statusCode: 200,
          body: JSON.stringify({
            messageSent: true
          })
        });

      } else {
        return callback(null, {
          statusCode: 400,
          body: JSON.stringify({
            error: 'recaptcha failed'
          })
        })
      }
    })
    .catch(err => {
      console.error(err);
    });
}
