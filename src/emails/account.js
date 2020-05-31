const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'shashankgaur1811@gmail.com',
    subject: 'Thanks for joining the community',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
  })
}

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'shashank014@gmail.com',
    subject: 'What we could have done?',
    text: `Its very sad that you are leaving ${name}. Please tell us what we could've done to make you stay longer.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
}