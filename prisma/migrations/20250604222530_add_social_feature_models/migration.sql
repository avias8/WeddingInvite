-- CreateTable
CREATE TABLE "GuestMedia" (
    "id" SERIAL NOT NULL,
    "gcsPath" TEXT NOT NULL,
    "originalFileName" TEXT,
    "contentType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploader_guest_id" INTEGER,

    CONSTRAINT "GuestMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaLike" (
    "id" SERIAL NOT NULL,
    "media_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaComment" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parent_comment_id" INTEGER,

    CONSTRAINT "MediaComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestMedia_gcsPath_key" ON "GuestMedia"("gcsPath");

-- CreateIndex
CREATE INDEX "GuestMedia_uploadedAt_idx" ON "GuestMedia"("uploadedAt");

-- CreateIndex
CREATE INDEX "MediaLike_media_id_idx" ON "MediaLike"("media_id");

-- CreateIndex
CREATE INDEX "MediaLike_guest_id_idx" ON "MediaLike"("guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "MediaLike_media_id_guest_id_key" ON "MediaLike"("media_id", "guest_id");

-- CreateIndex
CREATE INDEX "MediaComment_media_id_idx" ON "MediaComment"("media_id");

-- CreateIndex
CREATE INDEX "MediaComment_guest_id_idx" ON "MediaComment"("guest_id");

-- CreateIndex
CREATE INDEX "MediaComment_createdAt_idx" ON "MediaComment"("createdAt");

-- AddForeignKey
ALTER TABLE "GuestMedia" ADD CONSTRAINT "GuestMedia_uploader_guest_id_fkey" FOREIGN KEY ("uploader_guest_id") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaLike" ADD CONSTRAINT "MediaLike_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "GuestMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaLike" ADD CONSTRAINT "MediaLike_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaComment" ADD CONSTRAINT "MediaComment_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "GuestMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaComment" ADD CONSTRAINT "MediaComment_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaComment" ADD CONSTRAINT "comment_parent_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "MediaComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
