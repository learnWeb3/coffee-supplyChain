// express library
const express = require("express");

const PORT = 8000;
const app = new express();

app.use("/", express.static("dist"));

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
