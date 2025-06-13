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

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const currentDate = `${year}-${month}-${day}`
  return currentDate;
}
 
//Home Page
app.get("/", async(req, res) => {
  const currentDate = getCurrentDate();
  // Get date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const oneYearAgo = new Date ();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  
  const formatDate  = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const past30Days = formatDate(thirtyDaysAgo);
  const pastYear = formatDate(oneYearAgo);

  try {
    //console.log("API Key:", RAWG_API_KEY);
    //console.log("Request URL:", `${BASEURL}/games?key=${RAWG_API_KEY}&ordering=-rating&page=1`);


    //Helper function to fetch New Releases
    const getNewReleases = async () => {
      const response = await axios.get(`${BASEURL}/games?key=${RAWG_API_KEY}&ordering=-released&dates=${past30Days},${currentDate}&page_size=6`);
      const newReleases = response.data.results;
      return newReleases;
    };

    //Helper function to fetch Top Rated Games
    const getTopRatedGames = async () => {
      const response = await axios.get(`${BASEURL}/games?key=${RAWG_API_KEY}&ordering=-rating&dates=${pastYear},${currentDate}&page_size=6`);
      const topRated = response.data.results;
      //console.log("Top Rated: ", topRated.map(game => game.name));
      return topRated;
    }

    const [topRated, newReleases] = await Promise.all([
      getTopRatedGames(),
      getNewReleases(),
    ])
    
    res.render("index.ejs", { 
      topRated: topRated,
      newReleases: newReleases,
    });

  } catch (error) {
    console.error("Error fetching data", error.message);
    res.status(500).send("Something went wrong");
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})