-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "releaseDate" TEXT,
    "voteAverage" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TrendingSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "popularity" REAL NOT NULL,
    "voteAverage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "WatchlistItem_visitorId_createdAt_idx" ON "WatchlistItem"("visitorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_visitorId_movieId_key" ON "WatchlistItem"("visitorId", "movieId");

-- CreateIndex
CREATE INDEX "TrendingSnapshot_movieId_idx" ON "TrendingSnapshot"("movieId");

-- CreateIndex
CREATE INDEX "TrendingSnapshot_date_rank_idx" ON "TrendingSnapshot"("date", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingSnapshot_date_movieId_key" ON "TrendingSnapshot"("date", "movieId");
