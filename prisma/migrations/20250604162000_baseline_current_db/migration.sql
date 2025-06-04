-- CreateTable
CREATE TABLE "Invitee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isAttending" BOOLEAN,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "accessibilityInfo" TEXT,
    "comments" TEXT,
    "dietaryRestrictions" TEXT,
    "maxInvites" INTEGER NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "songRequests" TEXT,
    "emailOpenedAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),

    CONSTRAINT "Invitee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "invitee_id" INTEGER NOT NULL,
    "dietaryRestrictions" TEXT,
    "accessibilityInfo" TEXT,
    "isAttending" BOOLEAN,
    "table_id" INTEGER,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_email_key" ON "Invitee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_token_key" ON "Invitee"("token");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "Invitee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

