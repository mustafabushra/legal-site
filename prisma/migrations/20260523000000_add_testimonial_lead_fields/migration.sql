-- Add source and notes to Lead
ALTER TABLE "Lead" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'website';
ALTER TABLE "Lead" ADD COLUMN "notes" TEXT;

-- Create Testimonial table
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "role"      TEXT,
    "content"   TEXT NOT NULL,
    "rating"    INTEGER NOT NULL DEFAULT 5,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
