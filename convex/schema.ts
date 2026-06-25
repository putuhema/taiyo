import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  comments: defineTable({
    photoId: v.string(),
    author: v.string(),
    body: v.string(),
    clientId: v.string(),
    createdAt: v.number(),
  }).index("by_photo", ["photoId"]),

  likes: defineTable({
    photoId: v.string(),
    clientId: v.string(),
    createdAt: v.number(),
  })
    .index("by_photo", ["photoId"])
    .index("by_photo_and_client", ["photoId", "clientId"]),
});
