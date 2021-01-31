const express = require("express");
const app = express();
const morgan = require("morgan");
const request = require("request");
const session = require("express-session");
const connectDB = require("./config/mongoose")
const commands = require("./routes/command.routes")

app.set("view engine", "ejs");

//app.use(morgan("dev"));

app.use(express.static("public"));

connectDB(
  "mongodb+srv://Neil:Neil1234@cobalt.74cuh.mongodb.net/Data?retryWrites=true&w=majority"
);





const {
  CLIENT_ID,
  CLIENT_SECRET,
  SESSION_SECRET,
} = require("./config/config.json");


app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { expires: 2.16e7 },
  })
);

app.use(express.json())

app.use("/api/commands", commands)


const REDIRECT_URI = "http://localhost:9001/authorize";

const DISCORD_API = {
  AUTH: "https://discordapp.com/api/oauth2/authorize",
  TOKEN: "https://discordapp.com/api/oauth2/token",
};

const DAPI = "https://discordapp.com/api/v6";

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
    return;
  }
  res.redirect(formURL("AUTH"));
});

app.get("/logout", async (req, res, next) => {
  res.clearCookie("connect.sid");
  req.session.destroy();
  res.redirect("/");
});

app.get("/authorize", async (req, res, next) => {
  const code = req.query && req.query.code;

  if (!code) return next(new Error("NO QUERY CODE FOUND"));

  const data = await authorizeUserGrant(code);

  const userData = await getAsyncURL("/users/@me", data);
  const userGuilds = await getAsyncURL("/users/@me/guilds", data);

  if (!userData.avatar || !userData.username || !userGuilds)
    return res.redirect(formURL("AUTH"));

  userData.tag = `${userData.username}#${userData.discriminator}`;
  userData.avatar = `https://images.discordapp.net/avatars/${userData.id}/${userData.avatar}`;
  userGuilds.forEach((guild) => {
    guild.iconURL = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`;
  });
  req.session.user = { data: userData, guilds: userGuilds };
  req.session.data = data;

  if (req.session && req.session.user.data && req.session.user.guilds && data) {
    res.redirect(`/`);
  } else {
    res.redirect(formURL("AUTH"));
  }
});

const getAsyncURL = (url, data) =>
  new Promise((resolve) => {
    request.get(
      {
        url: `${DAPI}${url}`,
        headers: {
          Authorization: `${data.token_type} ${data.access_token}`,
        },
      },
      (err, res, body) => {
        if (err || !body) return resolve(false);
        try {
          return resolve(JSON.parse(body));
        } catch (err) {
          console.error(err);
          return resolve(false);
        }
      }
    );
  });

const authorizeUserGrant = (code) =>
  new Promise((resolve) => {
    request.post(
      {
        url: DISCORD_API.TOKEN,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        formData: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
        },
      },
      (err, res, body) => {
        if (err || !body) return resolve(false);
        try {
          const result = JSON.parse(body);
          if (result.error === "invalid_request") {
            return resolve(false);
          } else {
            return resolve(result);
          }
        } catch (err) {
          return resolve(false);
        }
      }
    );
  });

const formURL = (type) =>
  `${DISCORD_API[type]}?client_id=${CLIENT_ID}&redirect_uri=${encodeURI(
    REDIRECT_URI
  )}&response_type=code&scope=identify%20guilds`;


app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || false });
});

app.get("/features", (req, res) => {
  res.render("features", {user:req.session.user || false})
})

app.get("*", (req, res) => {
  res.render("404");
});

app.listen(9001, () => {
  console.log("App Running...");
});
