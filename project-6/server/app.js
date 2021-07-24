// express library
const express = require("express");
// express middleware to enable cors support
const cors = require("cors");
// express middleware to parse body content according to content-type of request
const bodyParser = require("body-parser");
// express middleware to support file upload
const fileUpload = require("express-fileupload");
// pinata development kit to interact with their services
const pinataSDK = require("@pinata/sdk");
// nodejs module to interact with files
const fs = require("fs");
// dotenv library to access environnemnt variables in development environement
require("dotenv").config();
// environnement variables
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;

const app = new express();

const PORT = 3000;

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

app.post("/upload", async (req, res) => {
  try {
    const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
    const readableStreamForFile = fs.createReadStream(
      req.files.document.tempFilePath
    );
    const options = {
      pinataMetadata: {
        name: "product authenticity",
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };
    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error while uploading the document" });
  }
});

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
