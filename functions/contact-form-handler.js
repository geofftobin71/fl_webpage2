const { parse } = require("querystring")
const fetch = require("node-fetch");

exports.handler = (event, context, callback) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    });
  }

  let body = {}

  try {
    body = JSON.parse(event.body)
  } catch (e) {
    body = parse(event.body)
  }

  // console.log(body);

  const name = body.name.trim();
  const email = body.email.trim();
  const message = body.message.trim();

  // Bail if name is missing
  if(!name) {
    if(event.headers['content-type'] === 'application/x-www-form-urlencoded') {
      // Do redirect for non JS enabled browsers
      return callback(null, {
        statusCode: 302,
        headers: {
          Location: '/contact-form-error/',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({})
      })
    } else {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: 'missing name'
        })
      })
    }
  }

  // Bail if email is missing
  if(!email) {
    if(event.headers['content-type'] === 'application/x-www-form-urlencoded') {
      // Do redirect for non JS enabled browsers
      return callback(null, {
        statusCode: 302,
        headers: {
          Location: '/contact-form-error/',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({})
      })
    } else {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: 'missing email'
        })
      })
    }
  }

  // Bail if message is missing
  if(!message) {
    if(event.headers['content-type'] === 'application/x-www-form-urlencoded') {
      // Do redirect for non JS enabled browsers
      return callback(null, {
        statusCode: 302,
        headers: {
          Location: '/contact-form-error/',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({})
      })
    } else {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: 'missing message'
        })
      })
    }
  }

  // Bail if password is filled in (honeypot)
  if(body.password) {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({})
    })
  }

  fetch('https://www.google.com/recaptcha/api/siteverify?secret=' + process.env.RECAPTCHA_SECRET_KEY + '&response=' + body.gRecaptchaResponse, { method: "post" })
    .then(res => res.json())
      .then(json => {
      console.log(json);

      if(event.headers['content-type'] === 'application/x-www-form-urlencoded') {
        // Do redirect for non JS enabled browsers
        return callback(null, {
          statusCode: 302,
          headers: {
            Location: '/thankyou-for-contacting-floriade/',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({})
        })
      }

      // Return data to AJAX request
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          messageSent: true
        })
      })
    })
  .catch(err => {
    console.error(err);
  });
}
