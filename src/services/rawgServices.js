import axios from "axios";
import  { BASEURL, RAWG_API_KEY } from "../config/constants.js";
import { getDateRange } from "../utils/dateUtils.js";

const { currentDate, past30Days, pastYear, in2Years } = getDateRange();

//Function to fetch New Releases
export const getNewReleases = async (limit = null, page = 1) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "-released",
  };

  // If limit is provided, add dates filter and page_size to the params object
  if (limit) {
    // Recent releases (past 30 days)
    params.dates = `${past30Days},${currentDate}`;
    params.page_size = limit; 
  } else {
    // All released games (no future games)
    params.dates = `0000-01-01,${currentDate}`; // Everything from year 0 to today
  }

  const response = await axios.get(`${BASEURL}/games`,{ params }); //url, endpoint and optional parameters
  const newReleases = response.data.results;
  //console.log("New Releases: ", newReleases.map(game => game.name));
  return newReleases;
};


//Function to fetch Top Rated Games
export const getTopRatedGames = async (limit = null) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "-rating"
  };

  if (limit) {
    params.dates = `${pastYear},${currentDate}`;
    params.page_size = limit;
  }
  const response = await axios.get(`${BASEURL}/games`,{params});
  const topRated = response.data.results;
  //console.log("Top Rated: ", topRated.map(game => game.name));
  return topRated;
}

//Function to fetch Upcoming Games
export const getUpcomingGames = async (limit = null) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "released",
  }

  if (limit) {
    params.dates = `${currentDate},${in2Years}`;
    params.page_size = limit;
  }

  const response = await axios.get(`${BASEURL}/games`,{params});
  const upComing = response.data.results;
  //console.log({upComing})
  return upComing;
}