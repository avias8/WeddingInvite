/*
  Warnings:

  - You are about to drop the `MediaComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MediaComment" DROP CONSTRAINT "MediaComment_guest_id_fkey";

-- DropForeignKey
ALTER TABLE "MediaComment" DROP CONSTRAINT "MediaComment_media_id_fkey";

-- DropForeignKey
ALTER TABLE "MediaComment" DROP CONSTRAINT "comment_parent_fk";

-- DropForeignKey
ALTER TABLE "MediaLike" DROP CONSTRAINT "MediaLike_guest_id_fkey";

-- DropForeignKey
ALTER TABLE "MediaLike" DROP CONSTRAINT "MediaLike_media_id_fkey";

-- AlterTable
ALTER TABLE "GuestMedia" ADD COLUMN     "caption" VARCHAR(150);

-- DropTable
DROP TABLE "MediaComment";

-- DropTable
DROP TABLE "MediaLike";
