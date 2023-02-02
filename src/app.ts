import express, { Application, json} from "express";
import { startDatabase } from "./database";
import { createMovie, deleteMovie, showMovieList, updateMovie } from "./functions";
import { verifyId, verifyName } from "./middlewares";

const app: Application = express();
app.use(json());


app.get('/movies' ,showMovieList)
app.post('/movies',verifyName,createMovie)
app.patch('/movies/:id',verifyId,verifyName,updateMovie)
app.delete('/movies/:id',verifyId,deleteMovie)



const PORT: number = 3000;
app.listen(PORT, async () => {
    await startDatabase() 
    console.log("Server running")
});