require("dotenv").config();

const fs = require("fs/promises");
const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch(process.env.API_SERPAPI);

const express = require("express");
var bodyParser = require("body-parser");

const cors = require("cors");
var bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 9000;

var jsonParser = bodyParser.json();

app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const textToSpeech = require("@google-cloud/text-to-speech");

app.post("/tts", jsonParser, async (req, res) => {
  if (req.body.text) {
    // The text to synthesize
    console.log("text to synthesize: " + req.body.text);
    const text = req.body.text;
    // const voice = req.body.voice;

    const requestBody = {
      input: {
        text: req.body.text,
      },
      voice: {
        languageCode: "en-US",
        name: "en-US-Studio-O",
        // ssmlGender: "Male",
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    };

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          // Authorization: `Token AIzaSyBVYukHSXjIeer35wPFTWe4WhfgQ0-eaBE`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    )
      .then((response) => {
        if (!response.ok) {
          //throw new Error("Error calling Google Text-to-Speech API");
          console.log("Error calling Google Text-to-Speech API");
        }
        return response.json();
      })
      .then((responseData) => {
        const audioContent = responseData.audioContent;
        //console.log("Audio content received:");
        //console.log(audioContent);

        res.json({
          audioContent: audioContent,
        });

        // Here, you can save the audioContent to a file or use it as needed
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
app.get("/duckduckgo", async (req, res) => {
  // Récupérer la question de la requête
  const question = req.query.q;
  const url = new URL("https://api.duckduckgo.com/");
  url.searchParams.set("q", question);
  url.searchParams.set("format", "json");
  url.searchParams.set("pretty", "1");

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred with the DuckDuckGo API request." });
    });
});

app.post("/duckduckgo", jsonParser, async (req, res) => {
  const question = req.body.question;
  console.log("question: " + question);
  const url = new URL("https://api.duckduckgo.com/");
  url.searchParams.set("q", question);
  url.searchParams.set("format", "json");
  url.searchParams.set("pretty", "1");

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred with the DuckDuckGo API request." });
    });
});
app.post("/search", async (req, res) => {
  const params = {
    engine: "google",
    q: req.body.question,
    location: "Lausanne",
    google_domain: "google.com",
    gl: "ch",
    hl: "en",
  };

  search.json(params, (data) => {
    res.json(data);
  });
});

app.listen(PORT, () => console.log(`Sever is running port ${PORT} ...`));
