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

interface iPagination {
 prevPage : string | null,
 nextPage: string | null,
 count: string | number,
 data: iMoviesId[]
}

type tMoviesResults = QueryResult<iMoviesId>

export {iMovies,iMoviesId,tMoviesResults,iPagination}
