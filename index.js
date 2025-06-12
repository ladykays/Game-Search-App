import express from "express";
import bodyParser from "body-parser"
import axios from "axios";
import dotenv from "dotenv";

const app = express();
const port = 3000;
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const BASEURL = "https://api.rawg.io/api/";

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
 
//Home Page
app.get("/", (req, res) => {
  res.render("index.ejs");
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})