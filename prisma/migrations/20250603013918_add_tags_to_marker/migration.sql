-- DropIndex
DROP INDEX "Post_likes_idx";

-- AlterTable
ALTER TABLE "Marker" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
