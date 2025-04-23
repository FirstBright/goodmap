-- CreateIndex
CREATE INDEX "Marker_id_idx" ON "Marker"("id");

-- CreateIndex
CREATE INDEX "Post_markerId_idx" ON "Post"("markerId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_likes_idx" ON "Post"("likes");
