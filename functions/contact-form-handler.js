const nodemailer = require("nodemailer");
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

exports.handler = (event, context) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    };
  }

  let body = JSON.parse(event.body)

  console.log(body);

  const name = body.name.trim();
  const email = body.email.trim();
  const message = body.message.trim();

  // Bail if name is missing
  if(!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'missing name'
      })
    }
  }

  // Bail if email is missing
  if(!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'missing email'
      })
    }
  }

  // Bail if message is missing
  if(!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'missing message'
      })
    }
  }

  // Bail if password is filled in (honeypot)
  if(body.password) {
    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }

  fetch('https://www.google.com/recaptcha/api/siteverify?secret=' + process.env.RECAPTCHA_SECRET_KEY + '&response=' + body.gRecaptchaResponse, { method: 'post' })
    .then(res => console.log(res));
  /*
    .then(res => res.json())
    .then(json => {
      // console.log(json);

      if((json.success) && (json.action === 'contactform') && (Number(json.score) > 0.5)) {

        const html_template = fs.readFileSync('email/contact-thankyou.html', 'utf8');

        let html_body = html_template;
        html_body = html_body.replace('%email_heading%', escape(body.heading));
        html_body = html_body.replace('%name%', escape(name));
        html_body = html_body.replace('%message%', escape(message));
        html_body = juice(html_body);

        // console.log(html_body);

        const txt_template = fs.readFileSync('email/contact-thankyou.txt', 'utf8');

        let txt_body = txt_template;
        txt_body = txt_body.replace('%email_heading%', body.heading);
        txt_body = txt_body.replace('%name%', name);
        txt_body = txt_body.replace('%message%', message);
        txt_body = juice(txt_body);

        // console.log(txt_body);

        var transporter = nodemailer.createTransport({
          host: "smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: "ba2cc93943e6dc",
            pass: "01a7c7d695af91"
          }
        });

        transporter.sendMail({
          from: '"Floriade" <no-reply@mailgen.js>',
          to: `"${name}" <${email}>`,
          subject: body.subject,
          html: html_body,
          text: txt_body,
        }, function (err) {
          if(err) {
            console.error(err);

            return {
              statusCode: 400,
              body: JSON.stringify({
                error: err
              })
            }
          }

          // console.log('Message sent successfully.');

          return {
            statusCode: 200,
            body: JSON.stringify({
              messageSent: true
            })
          }
        });

      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'recaptcha failed'
          })
        }
      }
    })
    .catch(err => {
      console.error(err);
    });
  */
}
