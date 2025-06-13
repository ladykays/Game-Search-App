import express from "express";
import bodyParser from "body-parser"
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const BASEURL = "https://api.rawg.io/api";

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
 
//Home Page
//Top Rated Games
app.get("/", async(req, res) => {
  try {
    //console.log("API Key:", RAWG_API_KEY);
    //console.log("Request URL:", `${BASEURL}/games?key=${RAWG_API_KEY}&ordering=-rating&page=1`);
    const response = await axios.get(`${BASEURL}/games?key=${RAWG_API_KEY}&ordering=-rating`);
    const genresResponse = await axios.get(`${BASEURL}/genres?key=${RAWG_API_KEY}`)
    const topRated = response.data.results;
    console.log("Top Rated: ", topRated.map(game => game.name));
    res.render("index.ejs", { topRated: topRated });

  } catch (error) {
    console.error("Error fetching data", error.message);
    res.status(500).send("Something went wrong");
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})