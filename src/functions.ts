import { Response, Request } from "express";
import format from "pg-format";
import { client } from "./database";
import { iMovies, iMoviesId, tMoviesResults } from "./interfaces";

const createMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
   
    const movieData :iMovies = await movieValidation(req.body);
      const movieString: string = format(
        `
       INSERT INTO
          movies(%I)
       VALUES
          (%L)
          RETURNING *
      `,
        Object.keys(movieData),
        Object.values(movieData)
      );

      const movieResult: tMoviesResults = await client.query(movieString);
      const movie: iMoviesId = movieResult.rows[0];

    return res.status(201).json(movie);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: err });
  }
};

const showMovieList = async (  req: Request,res: Response): Promise<Response> => {
  const query: string = `
      SELECT 
        * 
      FROM 
        movies
      `;

  const queryResult: tMoviesResults = await client.query(query);
  return res.status(200).json(queryResult.rows);
};

const movieValidation = async (payload: any): Promise<iMovies> => {
  const query: string = `
  SELECT COUNT(*)
   FROM movies
   WHERE "movieName" LIKE '${payload.movieName}';
  `;
  const queryResult: tMoviesResults = await client.query(query);

  if (Number(queryResult.rows[0].count) > 0) {
    throw new Error(`Movie already exists.`);
  }

  return payload;
};


export { showMovieList, createMovie };
