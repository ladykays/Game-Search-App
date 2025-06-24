import express from "express";
import { 
  getHomePage, 
  getResultsPage,
  getGamePage,
  getGenresPage,
  getSearchPage, //for genre search
  getPlatformsPage, 
  searchGames, //gor game saerch form
} from "../controllers/gameController.js";

const router = express.Router();

router.get("/", getHomePage);
router.get("/results", getResultsPage);
router.get("/game/:id", getGamePage);
router.get("/genres", getGenresPage);
router.get("/search", getSearchPage);
router.get("/platforms", getPlatformsPage);
router.get("/search-games", searchGames);

export  default router;
