import {
  getTopRatedGames,
  getNewReleases,
  getUpcomingGames,
  getAllGames,
  getGameDetails,
  getScreenshots,
  getGenres,
  getFilterByGenre,
} from "../services/rawgServices.js";

//Homepage
export const getHomePage = async(req, res) => {
  try {
    const [topRated, newReleases, upComing, genres] = await Promise.all([
      getTopRatedGames(6), // Returns 6 top rated games
      getNewReleases(6), // Returns 6 most recent releases
      getUpcomingGames(6), // Returns 6 most recent upcoming games
      getGenres(3), //Get 3 genres
    ])
    
    res.render("index.ejs", { 
      topRated: topRated,
      newReleases: newReleases,
      upComing: upComing,
      genres,
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
    let games;
    let title;
    
    if (req.query.filter === "newReleases") {
      games = await getNewReleases();
      title = "New Releases";
    }
    else if (req.query.filter === "topRated") {
      games = await getTopRatedGames();
      title = "Top Rated Games";
    }
    else if (req.query.filter === "upComing") {
      games = (await getUpcomingGames()).filter(game => game.background_image); //only get games with a background image
      title = "Upcoming Games";
    } else {
      games = await getAllGames();
      title = "Browse All Games";
    }
    res.render("results.ejs", {
      games,
      title
    });
    
    
  } catch (error) {
    console.error("Error fetching data", error)
    res.status(500).send("Something went wrong");
  }
}

//Individual Game Page
export const getGamePage = async(req, res) => {
  try {
    const { id } = req.params;
    const { game_pk } = req.params;

    if (!id) {
      return res.status(400).send("Game ID is required");
    }

    //fetch gameDetails and screenshot in parallel
    const [gameDetails, screenshots] = await Promise.all([
      getGameDetails(id),
      getScreenshots(id, game_pk)
    ]);
    res.render("game.ejs", {
      gameDetails,
      screenshots: screenshots || [] // Ensure screenshots is always an array
    })

  } catch (error) {
    console.log("Error fetching game details", error)
    res.status(500).send(`Error loading game: ${error.message}`)
  }
}

//Genres Page
export const getGenresPage = async(req, res) => {
  try {
    const genres = await getGenres();
    res.render("genres.ejs", {genres})
  } catch (error) {
    console.log("Error fetching genres", error)
    res.status(500).send(`Error fetching genres: ${error.message}`)
  }
}

//Search Page
export const getSearchPage = async(req, res) => {
  try {
    const {genre} = req.query;
    const [filteredGenre, topRated] = await Promise.all([
      getFilterByGenre(genre),
      getTopRatedGames(2),
    ]);

    res.render("search.ejs", {
      filteredGenre,
      topRated: topRated,
    } )

  } catch (error) {
    console.log("Error fetching requested games", error)
    res.status(500).send(`Error fetching requested games: ${error.message}`)
  }
}
