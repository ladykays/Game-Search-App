import express from "express";
import { 
  getHomePage, 
  getResultsPage,
  getGamePage,
} from "../controllers/gameController.js";

const router = express.Router();

router.get("/", getHomePage);
router.get("/results", getResultsPage);
router.get("/game/:id", getGamePage);

export  default router;
