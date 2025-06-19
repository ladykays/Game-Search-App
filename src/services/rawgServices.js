import axios from "axios";
import  { 
  BASEURL, 
  RAWG_API_KEY, 
  ESRB_NAMES 
} from "../config/constants.js";
import { getDateRange } from "../utils/dateUtils.js";
import { exclude18Plus } from "../utils/filterUtils.js";
const { 
  currentDate, 
  past30Days, 
  pastYear, 
  past5Years, 
  in2Years 
} = getDateRange();

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
    params.page_size = limit; 
  } else {
    // All released games (no future games)
    params.dates = `0000-01-01,${currentDate}`; // Everything from year 0 to today
  }

  const response = await axios.get(`${BASEURL}/games`,{ params }); //url, endpoint and optional parameters

  const newReleases = response.data.results;

  //Uncomment this 👇 and  if you want filtered out data that does not display matured content
  //const filteredNewReleases = exclude18Plus(newReleases); //filtered out data
  
  //console.log("New Releases: ", newReleases.map(game => game.name));

  // For unfiltered data
  return newReleases;

  //For filtered data
  //return filteredNewReleases //uncomment 👈 for filtered data
};


//Function to fetch Top Rated Games
export const getTopRatedGames = async (limit = null) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "-rating",
  };

  if (limit) {
    params.dates = `${past5Years},${currentDate}`;
    params.page_size = limit;
  }
  const response = await axios.get(`${BASEURL}/games`,{params});
  const topRated = response.data.results;
  //console.log("Top Rated: ", topRated.map(game => game.name));
  const filteredTopRated = exclude18Plus(topRated)
  //return filteredTopRated; // for filtered content
  return topRated; //for non filtered content
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

//Function to fetch All Games
export const getAllGames = async (limit = null) => {
  const params = {
    key: RAWG_API_KEY,
    ordering: "name"
  }

  const response = await axios.get(`${BASEURL}/games`, {params});
  const allGames = response.data.results;

  return allGames;
}

//Function to get a particular game page
export const getGameDetails = async (id) => {
  const params = {
    key: RAWG_API_KEY,
  };

  const response = await axios.get(`${BASEURL}/games/${id}`, {params});
  const gameDetails = response.data;

  //Trying to add video
  /* const [gameResponse, videoResponse] = await Promise.all([
    axios.get(`${BASEURL}/games/${id}`, {params}),
    axios.get(`${BASEURL}/games/${id}/movies`, {params})
  ]);
  console.log("Video Data: ", videoResponse.data.results)

  //Copy all properties from gameResponse.data into the new gameDetails object and add videos ppty to it
  const gameDetails = {
    ...gameResponse.data,
    videos: videoResponse.data.results || []
  }; */

  console.log("Game Details: ", {gameDetails})
  return gameDetails;
};
