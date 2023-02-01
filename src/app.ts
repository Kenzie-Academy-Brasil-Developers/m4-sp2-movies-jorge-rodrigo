import express, { Application, json} from "express";
import { startDatabase } from "./database";
import { createMovie, showMovieList } from "./functions";

const app: Application = express();
app.use(json());

app.get('/movies' ,showMovieList)
app.post('/movies',createMovie)



const PORT: number = 3000;
app.listen(PORT, async () => {
    await startDatabase() 
    console.log("Server running")
});