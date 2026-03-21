-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distanceNm" DOUBLE PRECISION,
    "durationSeconds" INTEGER,
    "avgSpeedKn" DOUBLE PRECISION,
    "maxSpeedKn" DOUBLE PRECISION,

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackPoint" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3),
    "speedKn" DOUBLE PRECISION,
    "headingDeg" DOUBLE PRECISION,
    "elevationM" DOUBLE PRECISION,
    "pointIndex" INTEGER NOT NULL,

    CONSTRAINT "TrackPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackPoint_traceId_idx" ON "TrackPoint"("traceId");

-- AddForeignKey
ALTER TABLE "TrackPoint" ADD CONSTRAINT "TrackPoint_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "Trace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
