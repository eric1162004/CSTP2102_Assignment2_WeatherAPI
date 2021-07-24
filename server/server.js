const express = require("express");
const app = express();
const https = require("https");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/CityWeather", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const citySchema = new mongoose.Schema({
  name: String,
  temperature: Number,
  description: String,
});

const cityModel = mongoose.model("cities", citySchema);

const apikey = "895878a75e7da14b845308f3a5ddefe4";

app.listen(5000, (err) => {
  if (err) console.log(err);
  else console.log("Listening on 5000");
});

app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

app.use(bodyparser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
  var cityName = req.body.cityName;
  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=metric&appid=" +
    apikey;

  https.get(url, function (https_res) {
    https_res.on("data", function (data) {
      const parsedData = JSON.parse(data);
      if (JSON.parse(data).cod == "404") {
        return res.send(`${parsedData.message}`);
      }

      res.write(
        "<h1> " + cityName + " weather is " + parsedData.weather[0].description
      ) + "</h1>";
      res.write("<h1> " + cityName + " temp is " + parsedData.main.temp) +
        "</h1>";
      res.write(
        '  <img src="' +
          "http://openweathermap.org/img/wn/" +
          parsedData.weather[0].icon +
          '.png"' +
          "/>"
      );
      res.send();
    });
  });
});

app.get("/contact", (req, res) => {
  res.send(
    'Hi there, here is my <a href="mailto:nabil@eceubc.ca"> email </a>.'
  );
});

app.get("/cities/:city_name", (req, res) => {
  const cityName = req.params.city_name;

  cityModel.find(
    { name: { $regex: new RegExp(`^${cityName}$`, "i") } },
    (err, cities) => {
      if (err) {
        res.send("server error");
      } else {
        return cities.length !== 0
          ? res.send(JSON.stringify(cities))
          : res.send(
              `Weather information for city - <i>${cityName}</i> is not available`
            );
      }
    }
  );
});

app.get("/cities", (req, res) => {
  cityModel.find({}, (err, cities) => {
    if (err) {
      res.send("server error");
    } else {
      res.json(cities);
    }
  });
});

app.post("/insert", (req, res) => {
  const { name, temperature, description } = req.body;

  if (!name || !temperature || !description)
    return res.send("Invalid Body Argument");

  cityModel.create(
    {
      name,
      temperature,
      description,
    },
    (err, data) => {
      if (err) {
        res.send("server error");
      } else {
        console.log(data);
        res.send("Inserted Record!");
      }
    }
  );
});

app.delete("/delete/:name", (req, res) => {
  const cityName = req.params.name;

  cityModel.deleteOne(
    { name: { $regex: new RegExp(`^${cityName}$`, "i") } },
    (err, data) => {
      if (err) {
        res.send("server error");
      } else {
        console.log(data);
        res.send(`Deleted Record Count: ${data.deletedCount}`);
      }
    }
  );
});
