require("dotenv").config();

module.exports = {
    DB_URL: process.env.DB_URL, // take from env
    SPRINT_DB_URL: process.env.SPRINT_DB_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    TOKEN_EXPIRY: process.env.TOKEN_EXPIRY
  };