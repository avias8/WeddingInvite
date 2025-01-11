/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Invitee` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `Invitee` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Invitee" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_token_key" ON "Invitee"("token");
