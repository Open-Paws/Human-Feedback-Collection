-- Add a column to accept information about the user's profile.
ALTER TABLE "User" ADD COLUMN "profileContent" TEXT NOT NULL DEFAULT '';