import express from "express";
import { 
  getHomePage, 
  getResultsPage 
} from "../controllers/gameController.js";

const router = express.Router();

router.get("/", getHomePage);
router.get("/results", getResultsPage);

export  default router;