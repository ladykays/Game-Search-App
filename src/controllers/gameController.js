import {
  getTopRatedGames,
  getNewReleases,
  getUpcomingGames,
} from "../services/rawgServices.js";

//Homepage
export const getHomePage = async(req, res) => {
  try {
    const [topRated, newReleases, upComing] = await Promise.all([
      getTopRatedGames(6), // Returns 6 top rated games
      getNewReleases(6), // Returns 6 most recent releases
      getUpcomingGames(6), // Returns 6 most recent upcoming games
    ])
    
    res.render("index.ejs", { 
      topRated: topRated,
      newReleases: newReleases,
      upComing: upComing,
    });

  } catch (error) {
    console.error("Error fetching data", error.message);
    console.log(error)
    res.status(500).send("Something went wrong");
  }
};

// Results page
export const getResultsPage = async (req, res) => {
  try {
    const newReleases = await getNewReleases();
    console.log("New Releases:", newReleases )
    res.render("results.ejs", { newReleases: newReleases });
  } catch (error) {
    console.error("Error fetching data", error)
    res.status(500).send("Something went wrong");
  }
}