const { Sequelize, DataTypes } = require('sequelize');
const mailgun = require('mailgun-js');
const functions = require('@google-cloud/functions-framework');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });




const EmailTracking = sequelize.define('email_tracking', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiryTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

async function sendVerificationEmail(username, token) {
  const dns = process.env.S_DNS_NAME;
  const port = process.env.S_PORT;
  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to: username,
    subject: 'Verify your email address',
    html: `<p>Click the following link to verify your email address: <a href="https://${dns}/verify?token=${token}">Verify Email</a></p>`,
  };

  mg.messages().send(data, (error, body) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', body);
    }
  });
}

function generateToken() {
  const token = Math.random().toString(36).substring(2, 10);
  return token;
}


functions.cloudEvent('verifyEmail', async cloudEvent => {
  console.log(cloudEvent.data);
  const pubsubMessage = cloudEvent.data.message.data
  ? JSON.parse(Buffer.from(cloudEvent.data.message.data, 'base64').toString())
  : {};

  console.log(pubsubMessage);

if (pubsubMessage.username) {
  const username = pubsubMessage.username;
  const token = generateToken();
  const expiryTime = new Date(Date.now() + 2 * 60 * 1000);
  try {
    await sequelize.sync(); 
    await EmailTracking.create({ email : username, token : token, expiryTime : expiryTime });
    sendVerificationEmail(username, token);
    console.log(`Verification email sent to ${username}`);
  } catch (error) {
    console.error('Error creating email tracking record:', error);
  }
} else {
  console.log('Email not found in the pub/sub message');
}
});