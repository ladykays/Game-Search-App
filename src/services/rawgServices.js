import axios from "axios";
import  { BASEURL, RAWG_API_KEY } from "../config/constants.js";
import { getDateRange } from "../utils/dateUtils.js";

const { currentDate, past30Days, pastYear, in2Years } = getDateRange();

//Function to fetch New Releases
export const getNewReleases = async () => {
  const response = await axios.get(
    `${BASEURL}/games?key=${RAWG_API_KEY}&ordering=-released&dates=${past30Days},${currentDate}&page_size=6`
  );
  const newReleases = response.data.results;
  return newReleases;
};

//Function to fetch Top Rated Games
export const getTopRatedGames = async () => {
  const response = await axios.get(
    `${BASEURL}/games?key=${RAWG_API_KEY}&ordering=-rating&dates=${pastYear},${currentDate}&page_size=6`
  );
  const topRated = response.data.results;
  //console.log("Top Rated: ", topRated.map(game => game.name));
  return topRated;
}

//Function to fetch Upcoming Games
export const getUpcomingGames = async () => {
  const response = await axios.get(
    `${BASEURL}/games?key=${RAWG_API_KEY}&ordering=released&dates=${currentDate},${in2Years}&page_size=6`
  );
  const upComing = response.data.results;
  //console.log({upComing})
  return upComing;
}