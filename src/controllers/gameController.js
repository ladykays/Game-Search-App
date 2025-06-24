import express from "express";
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
import { generatePagination } from "../utils/pagenation.js";

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
      topRated: topRated.results,
      newReleases: newReleases.results,
      upComing: upComing.results,
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
    let gamesData;
    let title;
    const page = parseInt(req.query.page) || 1;
    const limit = 21; // Items per page
    const filter = req.query.filter || 'allGames';
    
    if (filter === "newReleases") {
      gamesData = await getNewReleases(limit, page);
      title = "New Releases";
    }
    else if (filter === "topRated") {
      gamesData = await getTopRatedGames(limit, page);
      title = "Top Rated Games";
    }
    else if (filter === "upComing") {
      gamesData = (await getUpcomingGames(limit, page)).filter(game => game.background_image); //only get games with a background image
      title = "Upcoming Games";
    } else {
      gamesData = await getAllGames(limit, page);
      title = "Browse All Games";
    }

    const pagination = generatePagination(
      page,
      gamesData.count,
      limit,
      5 // visible pages
    );

    res.render("results.ejs", {
      games: gamesData.results,
      title,
      filter,
      ...pagination,
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
    let gamesData;
    let title;
    const page = parseInt(req.query.page) || 1;
    const limit = 21; // Items per page
    const filter = req.query.filter;

    if (filter === "pcGames") {
      gamesData = await getGamesByPlatform(4, limit, page);
      title = "PC Games"
    } else if (filter === "playstation") {
      // Get games for all PlayStation platforms (PS1-PS5, PSP, Vita)
      const psPlatformIds = [27, 15, 16, 18, 187, 17, 19] //.join(',') transforms an array into a comma-separated string. This allows us to pass multiple platform IDs to the API in a single request.
      gamesData = await getGamesByPlatform(psPlatformIds.join(','), limit, page);
      title = "PlayStation Games"
    } else if (filter === "xbox") {
      // Get games for all XBox platforms (Xbox One, Xbox Series S/X, Xbox 360, Xbox)
      const xboxPlatformIds = [1, 186, 14, 80 ];
      gamesData = await getGamesByPlatform(xboxPlatformIds.join(','), limit, page);
      title = "Xbox Games";
    } else if (filter === "nintendo") {
      // Get games for all Nintendo platforms (Switch, 3DS, DS, DSi, Wii U, Wii, GameCube, Nintendo 64,Game Boy Advance, Game Boy Color, Game Boy, SNES, NES) 
      const nintendoPlatformIds = [7, 8, 9, 13, 10, 11, 105, 83, 24, 43, 26, 79, 49];
      gamesData = await getGamesByPlatform(nintendoPlatformIds.join(','), limit, page); 
      title = "Nintendo Games";
    }

    const pagination = generatePagination(
      page,
      gamesData.count,
      limit,
      5 // visible pages
    );

    res.render("platforms.ejs", {
      games: gamesData.results,
      title,
      ...pagination,
      filter: req.query.filter,
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


    if (!search || search.trim() === "") {
      return res.redirect("/");
    }

    const { results: games = [], count = 0 }= await getSearchedGames(search, limit, page); //destructured results data

    const pagination = generatePagination(
      parseInt(page),
      count,
      limit,
      5, //visible pages
    )

    res.render("search-results.ejs", {
      title: `Search Results for "${search}"`,
      games,
      queryParams: search, 
      ...pagination //spread all pagination ppties
    })

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Error performing search');
  }
}
