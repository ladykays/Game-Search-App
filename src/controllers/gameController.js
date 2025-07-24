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
    const [topRated, newReleases, /* upComing, */ genres] = await Promise.all([
      getTopRatedGames(6), // Returns 6 top rated games
      getNewReleases(6), // Returns 6 most recent releases
      //getUpcomingGames(6), // Returns 6 most recent upcoming games
      getGenres(3), //Get 3 genres
    ])
    
    /* // Filter upcoming game to only those with images, then take first 6
    const upcomingWithImages = upComing.results.filter(game => game.background_image).slice(0, 6) */

    // Handling for upcoming games to ensure getting 6 games with images
    let upcomingWithImages = []; //empty array to store upcoming games with images
    let page = 1;

    // Keep fetching until we have 6 games with images OR we've checked 5 pages (safety limit)
    while (upcomingWithImages.length < 6 && page < 5) { 
      const upComing = await getUpcomingGames(12, page); // Fetch a page of upcoming games (12 per page to increase chances of finding games with images)
      const filtered = upComing.results.filter(game => game.background_image);
      upcomingWithImages = [...upcomingWithImages, ...filtered];
      page++;
    }
    // Take only the first 6 games that have images
    upcomingWithImages = upcomingWithImages.slice(0, 6);

    res.render("index.ejs", { 
      topRated: topRated.results,
      newReleases: newReleases.results,
      upComing: upcomingWithImages,
      genres,
      schemaType: "WebSite", // Basic schema type
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "GameVerz",
        "url": "https://www.gameverz.kre8tivedev.co.uk",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "/search-games?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      })
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
      /* gamesData = (await getUpcomingGames(limit, page)).filter(game => game.background_image); //only get games with a background image */
      const allUpcoming = await getUpcomingGames(limit, page);
      gamesData = {
        ...allUpcoming,
        results: allUpcoming.results.filter(game => game.background_image) 
      };
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
      schemaType: "ItemList", // Schema type appropriate for lists of games
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": gamesData.results.slice(0, 5).map((game, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "VideoGame",
            "name": game.name,
            "url": `https://www.gameverz.kre8tivedev.co.uk/game/${game.id}`,
            "image": game.background_image
          }
        }))
      })
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
      schemaType: "VideoGame", // Specific schema for game pages
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": gameDetails.name,
        "url": `https://www.gameverz.kre8tivedev.co.uk/game/${id}`,
        "description": gameDetails.description_raw || "Explore this game on GameVerz",
        "image": gameDetails.background_image,
        "genre": gameDetails.genres?.map(g => g.name) || [],
        "gamePlatform": gameDetails.platforms?.map(p => p.platform.name) || [],
        "aggregateRating": gameDetails.rating ? {
          "@type": "AggregateRating",
          "ratingValue": gameDetails.rating,
          "ratingCount": gameDetails.ratings_count || 0
        } : undefined,
        "datePublished": gameDetails.released
      })
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
    res.render("genres.ejs", {
      genres,
      schemaType: "CollectionPage", // Appropriate for category listings
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Game Genres",
        "description": "Browse games by genre on GameVerz",
        "hasPart": genres.map(genre => ({
          "@type": "CollectionPage",
          "name": genre.name,
          "url": `https://www.gameverz.kre8tivedev.co.uk/genres?genre=${genre.slug}`
        }))
      })
    })
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
      topRated: topRated.results,
      genreGames: genreGames || [],
      schemaType: "WebPage",
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `Games in ${filteredGenre.name} genre`,
        "description": `Browse ${filteredGenre.name} games on GameVerz`
      })
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
      schemaType: "CollectionPage",
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${title} on GameVerz`,
        "description": `Browse ${title} on GameVerz`,
        "about": {
          "@type": "Game",
          "gamePlatform": title.replace(" Games", "")
        }
      })
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
      ...pagination, //spread all pagination ppties
      schemaType: "ItemList",
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Search results for "${search}"`,
        "itemListElement": games.slice(0, 5).map((game, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "VideoGame",
            "name": game.name,
            "url": `https://www.gameverz.kre8tivedev.co.uk/game/${game.id}`,
            "image": game.background_image
          }
        }))
      })

    })

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Error performing search');
  }
}
