import express from "express";
import { getHomePage } from "../controllers/gameController.js";

const router = express.Router();

router.get("/", getHomePage);

export  default router;