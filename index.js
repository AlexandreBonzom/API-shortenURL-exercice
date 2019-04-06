require("dotenv").config();
//Creation of server
const express = require("express");
const app = express();

//Middleware to parse req.bodies to use them on Node.js
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//instantation of CORS (enable the request)
const cors = require("cors");
app.use(cors());

//connection to mongoDB
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
});
//creation of model URL
const Schema = mongoose.Schema;
const shortUrlSchema = new Schema({
  shortenUrl: String,
  normalUrl: { type: String, required: true },
  counter: { type: Number, default: 0 }
});
//instantiation of collection
const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

//Function to create random characters.A-Za-z0-9
randomCharactersGenerator = async length => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  //test if the character chain is not already generated
  try {
    const shortenUrl = await ShortUrl.findOne({
      shortenUrl: `https://short-url-ALEXANDRE-BONZOM.herokuapp.com/${text}`
    });

    if (shortenUrl) {
      return randomCharactersGenerator(length);
    }
  } catch (error) {
    console.error({ message: error.message });
  }
  return text;
};

//CRUD
//create a new short URL
app.post("/create", async (req, res) => {
  try {
    //check if url is correct
    const valid = /^(ftp|http|https):\/\/[^ "]+$/.test(req.body.normalUrl);
    if (!valid) {
      res
        .status(400)
        .json({ message: "There is an error on the url entered." });
    } else {
      //check if the url has been already shorten
      const shortenUrl = await ShortUrl.findOne({
        normalUrl: req.body.normalUrl
      });
      if (shortenUrl) {
        res
          .status(400)
          .json({ message: "This address has been already shorten" });
      } else {
        const randomCharacters = await randomCharactersGenerator(5); //based on example, need to include Uppercase, I only found hexcecimal npm packages

        const newShortenUrl = new ShortUrl({
          shortenUrl: `https://short-url-alexandre-bonzom.herokuapp.com/${randomCharacters}`,
          normalUrl: req.body.normalUrl
        });
        await newShortenUrl.save();
        res.status(200).json(newShortenUrl);
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//read all the url
app.get("/read", async (req, res) => {
  try {
    const listUrls = await ShortUrl.find();
    res.status(200).json(listUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//read a specific route and update the counter
app.get("/read/:randomCharacters", async (req, res) => {
  try {
    const shortendUrl = await ShortUrl.findOne({
      shortenUrl: `https://short-url-alexandre-bonzom.herokuapp.com/${
        req.params.randomCharacters
      }`
    });
    shortendUrl.counter++;
    await shortendUrl.save();
    res.status(200).json(shortendUrl);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Not found" });
});
//launching server
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
