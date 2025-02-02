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

-- CreateTable
CREATE TABLE "SeatingAssignment" (
    "id" SERIAL NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "table_id" INTEGER NOT NULL,

    CONSTRAINT "SeatingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatingAssignment_guest_id_key" ON "SeatingAssignment"("guest_id");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "Invitee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingAssignment" ADD CONSTRAINT "SeatingAssignment_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
