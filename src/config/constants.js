import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const RAWG_API_KEY = process.env.RAWG_API_KEY;
export const BASEURL = "https://api.rawg.io/api";



