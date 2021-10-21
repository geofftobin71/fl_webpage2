const { parse } = require("querystring")

exports.handler = (event, context, callback) => {
  let body = {}

  try {
    body = JSON.parse(event.body)
  } catch (e) {
    body = parse(event.body)
  }

  // console.log(body);

  // Bail if name is missing
  if(!body.name) {
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
  if(!body.email) {
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
  if(!body.message) {
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
      statusCode: 400,
      body: JSON.stringify({})
    })
  }

  // Do my email subscription logic

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
}
