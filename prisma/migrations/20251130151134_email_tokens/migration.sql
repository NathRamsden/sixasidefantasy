/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `AuthToken` table. All the data in the column will be lost.
  - Added the required column `token` to the `AuthToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME,
    CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AuthToken" ("createdAt", "expiresAt", "id", "type", "usedAt", "userId") SELECT "createdAt", "expiresAt", "id", "type", "usedAt", "userId" FROM "AuthToken";
DROP TABLE "AuthToken";
ALTER TABLE "new_AuthToken" RENAME TO "AuthToken";
CREATE UNIQUE INDEX "AuthToken_token_key" ON "AuthToken"("token");
CREATE INDEX "AuthToken_userId_type_idx" ON "AuthToken"("userId", "type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
