const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorhandler = require("./middlewares/errorHandler");
const routeNotFoundHandlers = require("./middlewares/routeNotFoundHandler");
const { normalizePort } = require("./helpers");
const loginRoute = require("./routes/login.router");
const sprintRoute = require("./routes/SprintPlanning/Sprint/Sprint.router");
const sprintUsersRoute = require("./routes/SprintUsers/users.router");
const morgan = require("morgan");
const morganMiddleware = require("./utils/morganMiddleware");

const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const config = require("./config");
const logger = require("./utils/logger")

global.logger = logger

morgan.token('id', function getId (req) {
  return req.id
})

const assignId = (req, res, next) => {
  req.id = uuidv4()
  next()
}

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(assignId)
app.use(morganMiddleware)

// root route
app.get("/", (req, res) => {
  res.send("response from root route");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
  req.session.destroy();
  res.send("Good bye");
});

// use all routes here
app.use("/login", loginRoute);
app.use("/v1/sprints", sprintRoute);
app.use("/v1/sprintusers", sprintUsersRoute);

//error handler middlewares
app.use(routeNotFoundHandlers);
app.use(errorhandler);

const PORT = normalizePort(config.PORT || "3001");

app.listen(PORT, async () => {
  logger.info(`Server connected successfully on PORT: ${PORT}`);
});
