CREATE UNIQUE INDEX IF NOT EXISTS "unique_friendship_idx" ON "friendships" USING btree ("user_id","friend_id");