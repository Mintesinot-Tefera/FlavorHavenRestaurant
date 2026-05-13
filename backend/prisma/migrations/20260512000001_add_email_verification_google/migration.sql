-- AlterTable: make password nullable for OAuth users
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable: add email verification and Google OAuth columns
ALTER TABLE "users"
  ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "verification_token" TEXT,
  ADD COLUMN "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- Mark all existing users as already verified so they can still log in
UPDATE "users" SET "email_verified" = true;
