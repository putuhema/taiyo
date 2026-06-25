import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearForPhoto = mutation({
  args: { photoId: v.string() },
  handler: async (ctx, { photoId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_photo", (q) => q.eq("photoId", photoId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_photo", (q) => q.eq("photoId", photoId))
      .collect();
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }
  },
});
