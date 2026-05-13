-- Add theme JSON column to LandingContent
ALTER TABLE "LandingContent" ADD COLUMN "theme" TEXT NOT NULL DEFAULT '{}';
