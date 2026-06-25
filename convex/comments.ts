import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByPhoto = query({
  args: { photoId: v.string() },
  handler: async (ctx, { photoId }) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_photo", (q) => q.eq("photoId", photoId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    photoId: v.string(),
    author: v.string(),
    body: v.string(),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const author = args.author.trim();
    const body = args.body.trim();
    if (!author || !body) throw new Error("Author and comment required");
    if (body.length > 500) throw new Error("Comment too long");

    return await ctx.db.insert("comments", {
      photoId: args.photoId,
      author,
      body,
      clientId: args.clientId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments"), clientId: v.string() },
  handler: async (ctx, { commentId, clientId }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment) return;
    if (comment.clientId !== clientId) throw new Error("Not allowed");
    await ctx.db.delete(commentId);
  },
});
