import express from "express";
import { 
  getHomePage, 
  getResultsPage,
  getGamePage,
  getGenresPage,
  getSearchPage,
} from "../controllers/gameController.js";

const router = express.Router();

router.get("/", getHomePage);
router.get("/results", getResultsPage);
router.get("/game/:id", getGamePage);
router.get("/genres", getGenresPage);
router.get("/search", getSearchPage)

export  default router;
