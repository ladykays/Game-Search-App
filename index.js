import express from "express";
import bodyParser from "body-parser";
import { PORT } from "./src/config/constants.js";
import gameRoutes from "./src/routes/gameRoutes.js";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", gameRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});