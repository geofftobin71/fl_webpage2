const fetch = require('node-fetch');
const juice = require('juice');
const fs = require('fs');

exports.handler = (event, context, callback) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    });
  }

  let body = {}

  body = JSON.parse(event.body)

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

        const html_template = fs.readFileSync('email/contact-thankyou.html', 'utf8');

        let html_body = html_template;
        html_body = html_body.replace('%email_heading%', body.heading);
        html_body = html_body.replace('%name%', name);
        html_body = html_body.replace('%message%', message);
        html_body = juice(html_body);

        console.log(html_body);

        return callback(null, {
          statusCode: 200,
          body: JSON.stringify({
            messageSent: true
          })
        })
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
