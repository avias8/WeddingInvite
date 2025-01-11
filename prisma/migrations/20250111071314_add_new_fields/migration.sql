/*
  Warnings:

  - Added the required column `maxInvites` to the `Invitee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invitee" ADD COLUMN     "accessibilityInfo" TEXT,
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "dietaryRestrictions" TEXT,
ADD COLUMN     "maxInvites" INTEGER NOT NULL,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "songRequests" TEXT;
