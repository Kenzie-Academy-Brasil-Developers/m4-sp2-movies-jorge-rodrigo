import { NextFunction,Request,Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { iMoviesId, tMoviesResults } from "./interfaces";


const verifyName = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

  const { movieName } = req.body

  const movieTemplate: string = `SELECT * FROM movies WHERE "movieName" = $1;`

  const queryConfig: QueryConfig = {
    text: movieTemplate,
    values: [movieName],
  };

  const movie: tMoviesResults = await client.query(queryConfig);
  const foundMovie: iMoviesId = movie.rows[0];

  if (foundMovie) {
    const message: string = `The movie ${movieName} already exists`;
    return res.status(409).json({ message });
  }

  return next();
};


const verifyId = async ( req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const { id } = req.params

  const movieTemplate: string = `SELECT * FROM movies WHERE id = $1;`

  const queryConfig: QueryConfig = {
    text: movieTemplate,
    values: [id],
  };

  const movie: tMoviesResults = await client.query(queryConfig);
  const foundMovie: iMoviesId = movie.rows[0];

  if (!foundMovie) {
    const message: string = `The movie with the id: ${id} not found`;
    return res.status(404).json({ message });
  }

  return next();
}

export {verifyName,verifyId}
