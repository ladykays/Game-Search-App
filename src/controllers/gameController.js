import e from "express";
import {
  getTopRatedGames,
  getNewReleases,
  getUpcomingGames,
  getAllGames,
  getGameDetails,
  getScreenshots,
  getGenres,
  getFilterByGenre,
  getGamesByGenreSlug,
  getGamesByPlatform,
  getSearchedGames,
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
    //const { game_pk } = req.params;
    console.log("Game Page Requested for:", id);

    if (!id) {
      return res.status(400).send("Game ID is required");
    }

    //fetch gameDetails and screenshot in parallel
    const [gameDetails, screenshots] = await Promise.all([
      getGameDetails(id),
      getScreenshots(id)
    ]);
    res.render("game.ejs", {
      gameDetails,
      screenshots: screenshots || [],// Ensure screenshots is always an array
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
    let {genre} = req.query;

    // Normalize the genre parameter
    if (typeof genre === 'string') {
      genre = genre.toLowerCase().replace(/\s+/g, '-');
    }

    const [filteredGenre, topRated, genreGames] = await Promise.all([
      getFilterByGenre(genre),
      getTopRatedGames(2),
      getGamesByGenreSlug(genre, 8)
    ]);

    res.render("search.ejs", {
      filteredGenre,
      topRated: topRated,
      genreGames: genreGames || [],
    } )

  } catch (error) {
    console.log("Error fetching requested games", error)
    res.status(500).send(`Error fetching requested games: ${error.message}`)
  }
};

//Platforms Page
export const getPlatformsPage = async(req, res) => {
  try {
    let games;
    let title;

    if (req.query.filter === "pcGames") {
      games = await getGamesByPlatform(4);
      title = "PC Games"
    } else if (req.query.filter === "playstation") {
      // Get games for all PlayStation platforms (PS1-PS5, PSP, Vita)
      const psPlatformIds = [27, 15, 16, 18, 187, 17, 19] //.join(',') transforms an array into a comma-separated string. This allows us to pass multiple platform IDs to the API in a single request.
      games = await getGamesByPlatform(psPlatformIds.join(','));
      title = "PlayStation Games"
    } else if (req.query.filter === "xbox") {
      // Get games for all XBox platforms (Xbox One, Xbox Series S/X, Xbox 360, Xbox)
      const xboxPlatformIds = [1, 186, 14, 80 ];
      games = await getGamesByPlatform(xboxPlatformIds.join(','));
      title = "Xbox Games";
    } else if (req.query.filter === "nintendo") {
      // Get games for all Nintendo platforms (Switch, 3DS, DS, DSi, Wii U, Wii, GameCube, Nintendo 64,Game Boy Advance, Game Boy Color, Game Boy, SNES, NES) 
      const nintendoPlatformIds = [7, 8, 9, 13, 10, 11, 105, 83, 24, 43, 26, 79, 49];
      games = await getGamesByPlatform(nintendoPlatformIds.join(',')); 
      title = "Nintendo Games";
    }

    res.render("platforms.ejs", {
      games,
      title,
    });
  } catch (error) {
    console.log("Error fetching requested games", error)
    res.status(500).send(`Error fetching requested games: ${error.message}`)
  }
}

//Search Games
export const searchGames = async (req, res) => {
  try {
    const {search, page = 1} = req.query;
    const limit = 20; //results per page
    const pageRange = 5; //no of page buttons to show

    if (!search || search.trim() === "") {
      return res.redirect("/");
    }

    const searchData = await getSearchedGames(search, limit, page);
    const games = searchData.results || [];
    const count = searchData.count || 0;
    const totalPages = Math.ceil(count / limit);
    const currentPage = parseInt(page);

    //Calculate page range to display
    let startPage;
    let endPage;

    if(totalPages <= pageRange) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfRange = Math.floor(pageRange / 2);
      if(currentPage <= halfRange) {
        startPage = 1;
        endPage = pageRange;
      } else if (currentPage + halfRange >= totalPages) {
        startPage = totalPages - pageRange + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfRange;
        endPage = currentPage + halfRange;
      }
    }

    res.render("search-results.ejs", {
      title: `Search Results for "${search}"`,
      games,
      searchQuery: search, 
      currentPage: parseInt(page),
      totalPages,
      startPage,
      endPage,
      hasNextPage: parseInt(page) < totalPages,
      hasPreviousPage: parseInt(page) > 1,
    })

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Error performing search');
  }
}
