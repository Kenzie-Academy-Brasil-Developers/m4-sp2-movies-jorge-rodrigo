import { QueryResult } from "pg"

interface iMovies {
  movieName: string;
  movieDescription: string;
  movieDuration: number;
  moviePrice: number;
}

interface iMoviesId extends iMovies {
  id: string;
  count?:string
}

type tMoviesResults = QueryResult<iMoviesId>

export {iMovies,iMoviesId,tMoviesResults}
