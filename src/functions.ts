import { Response, Request } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import {  iMoviesId, iPagination, tMoviesResults } from "./interfaces";

const createMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
    const movieString: string = format(
      `
       INSERT INTO
          movies(%I)
       VALUES
          (%L)
          RETURNING *
      `,
      Object.keys(req.body),
      Object.values(req.body)
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

const showMovieList = async ( req: Request,res: Response): Promise<Response> => {
  let page = Number(req.query.page) || 1;
  let perPage = Number(req.query.perPage) || 5;
  let sort = req.query.sort;
  let order = req.query.order;


  if (page <= 0) {
    page = 1;
  }
  if (perPage > 5 || perPage <= 0) {
    perPage = 5;
  }
  if (sort === undefined) {
    const query: string = `
    SELECT * FROM movies
    ORDER BY id
    OFFSET $1 LIMIT $2 
    `;

    const queryConfig: QueryConfig = {
      text: query,
      values: [Number(perPage) * (Number(page) - 1), perPage],
    };

    const queryResult: tMoviesResults = await client.query(queryConfig);

    const baseUrl: string = "http://localhost:3000/movies";
    const prevPage: string | null = page > 1 ? `${baseUrl}?page=${Number(page) - 1}&perPage=${perPage}` : null;
    const nextPage: string | null = queryResult.rowCount > 0 ? `${baseUrl}?page=${Number(page) + 1}&perPage=${perPage}` : null;

    const pagination: iPagination = {
      prevPage: prevPage,
      nextPage: nextPage,
      count: queryResult.rowCount,
      data: queryResult.rows,
    };
    return res.status(200).json(pagination);
  }
  if (sort === "price") {
    sort = "moviePrice";
  }
  if (sort === "duration") {
    sort = "movieDuration";
  }
  if(sort !== "moviePrice"){
    if(sort !== "movieDuration"){
      res.status(404).json({message: `${sort} not found`})
    }
  }
  if(order !== "desc"){
    if(order === "asc"){
       order = "ASC"
    }
    if(order !== "DESC"){
      order = undefined
    }
  }
  if(order === "desc"){
    order = "DESC"
  }
  const query: string = `
  SELECT * FROM "movies" ORDER BY "${sort}" ${order !== undefined ? `${order}` : ``} OFFSET ${Number(perPage) * (Number(page) - 1)} LIMIT ${perPage}
    `;
  const queryResult: tMoviesResults = await client.query(query);
  const baseUrl: string = "http://localhost:3000/movies";
  const prevPage: string | null = page > 1 ? `${baseUrl}?page=${Number(page) - 1}&perPage=${perPage}` : null;
  const nextPage: string | null = queryResult.rowCount > 0 ? `${baseUrl}?page=${Number(page) + 1}&perPage=${perPage}` : null;

  const pagination: iPagination = {
    prevPage: prevPage,
    nextPage: nextPage,
    count: queryResult.rowCount,
    data: queryResult.rows,
  };

  return res.status(200).json(pagination);
};

const updateMovie = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id
  const movieKeys : string[] = Object.keys(req.body)
  const movieValues: string[] = Object.values(req.body)

  const movieUpdateTemplate: string = `
  UPDATE movies
  SET(%I) = ROW(%L)
  WHERE id = $1
  RETURNING *;
  ` 

  const queryFormat:string = format(movieUpdateTemplate,movieKeys,movieValues)
  const config: QueryConfig = { text: queryFormat, values: [id] } 

  const updatedMovie : tMoviesResults = await client.query(config)
  return res.status(200).json(updatedMovie.rows[0])
}

const deleteMovie = async (req: Request, res: Response): Promise<Response> => {4
  const id = req.params.id

  const movieDeleteTemplate: string = `
  DELETE FROM movies WHERE id = $1;
  ` 
  const config: QueryConfig = { text: movieDeleteTemplate, values: [id] } 

  const deletedMovie : tMoviesResults = await client.query(config)

  if(deletedMovie.rowCount < 1){
    return res.status(400).json({message: "Movie Not found"})
  }

  return res.status(204).json()
}

export { showMovieList, createMovie ,updateMovie,deleteMovie};
