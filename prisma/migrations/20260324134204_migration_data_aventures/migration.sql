-- Convertir chaque Aventure en Navigation de type AVENTURE
INSERT INTO "Navigation" ("id", "nom", "date", "type", "userId", "dossierId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  a."nom",
  COALESCE(
    (SELECT MIN(n."date") FROM "Navigation" n WHERE n."aventureId" = a."id"),
    a."createdAt"
  ),
  'AVENTURE',
  a."userId",
  a."dossierId",
  a."createdAt",
  a."updatedAt"
FROM "Aventure" a;

-- Rattacher les sous-navigations a leur nouvelle nav AVENTURE
UPDATE "Navigation" n
SET "parentNavId" = nav_aventure."id"
FROM (
  SELECT n2."id", a."id" AS "aventureId"
  FROM "Navigation" n2
  JOIN "Aventure" a ON n2."nom" = a."nom"
    AND n2."userId" = a."userId"
    AND n2."type" = 'AVENTURE'
) nav_aventure
WHERE n."aventureId" = nav_aventure."aventureId"
  AND n."type" != 'AVENTURE';
