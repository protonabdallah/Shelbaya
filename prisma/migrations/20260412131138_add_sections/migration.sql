-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "content" TEXT,
    "contentAr" TEXT,
    "category" TEXT NOT NULL DEFAULT 'photography',
    "tags" TEXT,
    "coverImage" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "gallery" TEXT,
    "sections" TEXT NOT NULL DEFAULT '["home_featured","works_page"]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Post" ("category", "content", "contentAr", "coverImage", "createdAt", "description", "descriptionAr", "featured", "gallery", "id", "mediaType", "mediaUrl", "published", "tags", "title", "titleAr", "updatedAt") SELECT "category", "content", "contentAr", "coverImage", "createdAt", "description", "descriptionAr", "featured", "gallery", "id", "mediaType", "mediaUrl", "published", "tags", "title", "titleAr", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
