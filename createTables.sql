CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  "movieName" VARCHAR(50) UNIQUE NOT NULL,
  "movieDescription" TEXT,
  "movieDuration" INTEGER NOT NULL,
  "moviePrice" INTEGER NOT NULL
);
