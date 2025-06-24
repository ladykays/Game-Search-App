import axios from "axios";
import { BASEURL, RAWG_API_KEY, ESRB_NAMES } from "../config/constants.js";
import { getDateRange } from "../utils/dateUtils.js";
import { exclude18Plus } from "../utils/filterUtils.js";
const { currentDate, past30Days, pastYear, past5Years, in2Years } =
  getDateRange();

//Function to fetch New Releases
export const getNewReleases = async (limit = null, page = 1) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "-released",
    page: page,
  };

  // If limit is provided, add dates filter and page_size to the params object
  if (limit) {
    // Recent releases (past 30 days)
    params.dates = `${past30Days},${currentDate}`;
    //params.dates = `${pastYear},${currentDate}`;
    params.page_size = limit;
  } else {
    // All released games (no future games)
    params.dates = `0000-01-01,${currentDate}`; // Everything from year 0 to today
  }

  const response = await axios.get(`${BASEURL}/games`, { params }); //url, endpoint and optional parameters

  

  //Uncomment this 👇 and  if you want filtered out data that does not display matured content
  //const filteredNewReleases = exclude18Plus(response.data.results); //filtered out data

  //console.log("New Releases: ", response.data.results.map(game => game.name));

  // For unfiltered data
  return {
    results: response.data.results,
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
  };

  //For filtered data
  //return filteredNewReleases //uncomment 👈 for filtered data
};

//Function to fetch Top Rated Games
export const getTopRatedGames = async (limit = null, page = 1) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "-rating",
    page: page,
  };

  if (limit) {
    //params.dates = `${past5Years},${currentDate}`;
    params.dates = `${pastYear},${currentDate}`;
    params.page_size = limit;
  }
  const response = await axios.get(`${BASEURL}/games`, { params });
  //const topRated = response.data.results;
  //console.log("Top Rated: ", topRated.map(game => game.name));
  //const filteredTopRated = exclude18Plus(topRated);
  //return filteredTopRated; // for filtered content
  return {
    results: response.data.results,
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
  }; //for non filtered content
};

//Function to fetch Upcoming Games
export const getUpcomingGames = async (limit = null, page = 1) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "released",
    page: page,
  };

  if (limit) {
    params.dates = `${currentDate},${in2Years}`;
    params.page_size = limit;
  }

  const response = await axios.get(`${BASEURL}/games`, { params });

  return {
    results: response.data.results,
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
  };
};

//Function to fetch All Games
export const getAllGames = async (limit = null, page = 1) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "name",
    page: page,
  };

  const response = await axios.get(`${BASEURL}/games`, { params });

  return {
    results: response.data.results,
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
  };
};

//Function to get a particular game page
export const getGameDetails = async (id) => {
  const params = {
    key: RAWG_API_KEY,
  };

  const response = await axios.get(`${BASEURL}/games/${id}`, { params });
  const gameDetails = response.data;

  //console.log("Game Details: ", {gameDetails})
  return gameDetails;
};

//Function to get screenshots
export const getScreenshots = async (game_pk) => {
  /* if (!gameId || typeof gameId !== 'string') {
    console.warn('Invalid game ID provided for screenshots:', gameId);
    return [];
  } */

  const params = {
    key: RAWG_API_KEY,
  };

  try {
    const response = await axios.get(`${BASEURL}/games/${game_pk}/screenshots`, {
      params,
    });
    return response.data.results;
    //console.log("Screenshots:", screenshots);
  } catch (error) {
    console.error("Error fetching screenshots:", game_pk, error);
    return [];
  }
};

//Function to get genres
export const getGenres = async (limit = null) => {
  const params = {
    key: RAWG_API_KEY,
  };

  if (limit) {
    params.page_size = limit;
  }
  try {
    const response = await axios.get(`${BASEURL}/genres`, { params });
    const genres = response.data.results;
    //console.log({genres})
    return genres;
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw error;
  }
};

//Function to get a particular genre by ID or slug
export const getFilterByGenre = async (id) => {
  const params = {
    key: RAWG_API_KEY,
  };

  const response = await axios.get(`${BASEURL}/genres/${id}`, { params });
  return response.data;
};

// Function to get games by genre slug
export const getGamesByGenreSlug = async (slug, limit = null) => {
  //Get the. genre details in order to get the ID
  const genreDetails = await getFilterByGenre(slug);
  //console.log({genreDetails})

  //Get games for this genre ID
  const params = {
    key: RAWG_API_KEY,
    genres: genreDetails.id,
    ordering: "-rating",
  };

  if (limit) {
    params.page_size = limit;
  }

  try {
    const response = await axios.get(`${BASEURL}/games`, { params });
    //console.log("Game details: ", response.data.results)
    return response.data.results;
  } catch (error) {
    console.error("Error fetching games by genre:", error);
    throw error;
  }
};

//Function to get games by platforms
export const getGamesByPlatform = async (id, limit = null, page = 1) => {
  const params = {
    key: RAWG_API_KEY,
    platforms: id,
    page: page,
    page_size: limit,
    ordering: "-added",
    exclude_additions: true, // (Optional) Exclude DLCs
  };

  try {
    const response = await axios.get(`${BASEURL}/games`, {params});
    console.log("Platforms: ", response.data.results);
    return {
      results: response.data.results,
        count: response.data.count, //total no of games
        next: response.data.next, //url for next page
        previous: response.data.previous, //ur from prev game
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
};

//Search Games Function
export const getSearchedGames = async(query, limit = null, page = 1) => {
  const params = {
    key: RAWG_API_KEY,
    search: query,
    page: page,
    page_size: limit,
    ordering: "-rating",
    search_exact: true,
  }

  try {
    const response = await axios.get(`${BASEURL}/games`, {params});
    console.log("Search: ", response.data.results);
    return {
      results: response.data.results,
      count: response.data.count, //total no of games
      next: response.data.next, //url for next page
      previous: response.data.previous, //ur from prev game
    }
  } catch (error) {
    console.error("Error searching games:", error);
    throw error;
  }
}
