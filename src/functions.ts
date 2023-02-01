import { Response, Request } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import { iMovies, iMoviesId, iPagination, tMoviesResults } from "./interfaces";

const createMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
    const movieData: iMovies = await movieValidation(req.body);
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

const showMovieList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let page = req.query.page || 1;
  let perPage = req.query.perPage || 5;
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
    OFFSET $1 LIMIT $2 
    `;

    const queryConfig: QueryConfig = {
      text: query,
      values: [Number(perPage) * (Number(page) - 1), perPage],
    };

    const queryResult: tMoviesResults = await client.query(queryConfig);

    const baseUrl: string = "http://localhost:3000/movies";
    const prevPage: string | null =
      page > 1
        ? `${baseUrl}?page=${Number(page) - 1}&perPage=${perPage}`
        : null;
    const nextPage: string | null =
      queryResult.rowCount > 0
        ? `${baseUrl}?page=${Number(page) + 1}&perPage=${perPage}`
        : null;

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
  
  const query: string = `
  SELECT * FROM "movies" ORDER BY "${sort}" ${order !== undefined ? `${order}` : ``} OFFSET ${Number(perPage) * (Number(page) - 1)} LIMIT ${perPage}
    `;
  const queryResult: tMoviesResults = await client.query(query);
  const baseUrl: string = "http://localhost:3000/movies";
  const prevPage: string | null =
    page > 1
      ? `${baseUrl}?page=${Number(page) - 1}&perPage=${perPage}`
      : null;
  const nextPage: string | null =
    queryResult.rowCount > 0
      ? `${baseUrl}?page=${Number(page) + 1}&perPage=${perPage}`
      : null;

  const pagination: iPagination = {
    prevPage: prevPage,
    nextPage: nextPage,
    count: queryResult.rowCount,
    data: queryResult.rows,
  };

  return res.status(200).json(pagination);
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
