import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByPhoto = query({
  args: { photoId: v.string(), clientId: v.string() },
  handler: async (ctx, { photoId, clientId }) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_photo", (q) => q.eq("photoId", photoId))
      .collect();

    const existing = likes.find((like) => like.clientId === clientId);

    return {
      count: likes.length,
      liked: Boolean(existing),
    };
  },
});

export const toggle = mutation({
  args: { photoId: v.string(), clientId: v.string() },
  handler: async (ctx, { photoId, clientId }) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_photo_and_client", (q) =>
        q.eq("photoId", photoId).eq("clientId", clientId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("likes", {
      photoId,
      clientId,
      createdAt: Date.now(),
    });
    return { liked: true };
  },
});
