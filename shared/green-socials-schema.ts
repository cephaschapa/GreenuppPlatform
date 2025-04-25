import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Green Socials - Social feature for agricultural community

// Post visibility enum
export const postVisibilityEnum = pgEnum('post_visibility', [
  'public',    // Visible to everyone
  'community', // Visible to specific groups
  'followers', // Visible to followers only
  'private'    // Visible to specified users only
]);

// Post types enum
export const postTypeEnum = pgEnum('post_type', [
  'text',          // Simple text post
  'image',         // Post with image(s)
  'article',       // Longer formatted content
  'question',      // Question seeking answers
  'poll',          // Poll/survey
  'event',         // Event announcement
  'milestone',     // Farming milestone
  'resource',      // Shared resource
  'tip',           // Quick farming tip
  'market_update'  // Market prices or trends
]);

// Verification status enum
export const verificationStatusEnum = pgEnum('verification_status', [
  'unverified',     // Default state
  'pending',        // Under review
  'verified',       // Officially verified
  'expert',         // Expert-level verification
  'rejected'        // Verification rejected
]);

// Relationship status enum
export const relationshipStatusEnum = pgEnum('relationship_status', [
  'following',      // User is following
  'followed_by',    // User is being followed
  'mutual',         // Both users follow each other
  'blocked',        // User has blocked the other
  'none'            // No relationship
]);

// User profiles extended for social features
export const socialProfiles = pgTable("social_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  location: text("location"),
  website: text("website"),
  verificationStatus: text("verification_status").default('unverified'),
  expertise: text("expertise").array(), // Areas of agricultural expertise
  experienceYears: integer("experience_years"),
  specializations: text("specializations").array(),
  badges: jsonb("badges").$type<{ name: string, icon: string, date: string }[]>(),
  socialLinks: jsonb("social_links").$type<Record<string, string>>(), // Other platforms
  // Engagement metrics
  postCount: integer("post_count").default(0),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  visibility: text("visibility").default('public'), // Profile visibility setting
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Social communities/groups
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  communityIcon: text("community_icon"),
  coverImage: text("cover_image"),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  // Community type (public, private, verified)
  isPrivate: boolean("is_private").default(false),
  isVerified: boolean("is_verified").default(false),
  // Categories and focus areas
  category: text("category").notNull(), // e.g., crop type, farming method
  tags: text("tags").array(),
  location: text("location"), // Geographic focus if applicable
  // Membership stats
  memberCount: integer("member_count").default(0),
  postCount: integer("post_count").default(0),
  rules: text("rules"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Community memberships
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").default('member'), // member, moderator, admin
  joinDate: timestamp("join_date").notNull().defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Social posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  postType: text("post_type").notNull().default('text'),
  visibility: text("visibility").notNull().default('public'),
  // Media content
  media: jsonb("media").$type<{ url: string, type: string, caption?: string }[]>(),
  // Community association (optional)
  communityId: integer("community_id").references(() => communities.id),
  // Location data (optional)
  locationName: text("location_name"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  // Season and climate context
  season: text("season"), // spring, summer, fall, winter
  growingZone: text("growing_zone"), // Agricultural growing zone
  weatherConditions: text("weather_conditions"), // Weather at time of post
  // Tags and mentions
  hashtags: text("hashtags").array(),
  mentionedUsers: integer("mentioned_users").array(), // User IDs mentioned
  cropsTags: text("crops_tags").array(), // Specific crops mentioned
  // Engagement metrics
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  saveCount: integer("save_count").default(0),
  // Verification and quality
  isVerified: boolean("is_verified").default(false), // Fact-checked by experts
  verifiedBy: integer("verified_by").references(() => users.id),
  verificationNote: text("verification_note"), // Explanation of verification
  qualityScore: integer("quality_score"), // Algorithmic quality assessment
  // Timestamps
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Comments on posts
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  // Parent comment for replies 
  parentId: integer("parent_id").references(() => comments.id),
  // Media attachments
  media: jsonb("media").$type<{ url: string, type: string }[]>(),
  // Engagement metrics
  likeCount: integer("like_count").default(0),
  replyCount: integer("reply_count").default(0),
  // Verification
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Comment likes
export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull().references(() => comments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User relationships (follows)
export const userRelationships = pgTable("user_relationships", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followedId: integer("followed_id").notNull().references(() => users.id),
  status: text("status").notNull().default('following'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Saved posts (bookmarks)
export const savedPosts = pgTable("saved_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
  collectionName: text("collection_name").default('Saved'), // Custom collection
});

// Post shares
export const postShares = pgTable("post_shares", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(), // 'profile', 'community', 'external'
  targetId: integer("target_id"), // Profile or community ID if applicable
  externalPlatform: text("external_platform"), // e.g., 'whatsapp', 'email', etc.
  sharedAt: timestamp("shared_at").notNull().defaultNow(),
});

// Knowledge base verified facts
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  crops: text("crops").array(),
  farmingMethods: text("farming_methods").array(),
  regions: text("regions").array(), // Applicable geographic regions
  seasons: text("seasons").array(), // Applicable seasons
  source: text("source"),
  sourceUrl: text("source_url"),
  authorId: integer("author_id").references(() => users.id),
  // Verification
  verificationStatus: text("verification_status").notNull().default('pending'),
  verifiedBy: integer("verified_by").references(() => users.id),
  verificationDate: timestamp("verification_date"),
  // Engagement
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Questions and Answers
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  crops: text("crops").array(),
  // Location context
  locationName: text("location_name"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  // Season context
  season: text("season"),
  growingZone: text("growing_zone"),
  // Status
  status: text("status").default('open'), // open, answered, closed
  // Engagement metrics
  viewCount: integer("view_count").default(0),
  answerCount: integer("answer_count").default(0),
  followCount: integer("follow_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Answers to questions
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  // Media attachments
  media: jsonb("media").$type<{ url: string, type: string }[]>(),
  // Engagement and verification
  isAccepted: boolean("is_accepted").default(false),
  upvoteCount: integer("upvote_count").default(0),
  downvoteCount: integer("downvote_count").default(0),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Answer votes
export const answerVotes = pgTable("answer_votes", {
  id: serial("id").primaryKey(),
  answerId: integer("answer_id").notNull().references(() => answers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  voteType: text("vote_type").notNull(), // upvote or downvote
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Events (for farming calendar, workshops, etc.)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull(), // workshop, market, conference, etc.
  // Community association (optional)
  communityId: integer("community_id").references(() => communities.id),
  // Location
  isVirtual: boolean("is_virtual").default(false),
  locationName: text("location_name"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  address: text("address"),
  // Timing
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  timezone: text("timezone"),
  // Registration
  isPrivate: boolean("is_private").default(false),
  maxAttendees: integer("max_attendees"),
  registrationRequired: boolean("registration_required").default(false),
  // Engagement
  attendeeCount: integer("attendee_count").default(0),
  interestedCount: integer("interested_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Event attendees
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // registered, attending, interested, declined
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
});

// Seasonal activity tracker
export const seasonalActivities = pgTable("seasonal_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  activityType: text("activity_type").notNull(), // planting, harvesting, etc.
  season: text("season").notNull(),
  year: integer("year").notNull(),
  crops: text("crops").array(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default('planned'), // planned, in-progress, completed
  results: text("results"),
  notes: text("notes"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User notifications for social activity
export const socialNotifications = pgTable("social_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // follow, mention, comment, like, etc.
  content: text("content").notNull(),
  relatedUserId: integer("related_user_id").references(() => users.id),
  relatedPostId: integer("related_post_id").references(() => posts.id),
  relatedCommentId: integer("related_comment_id").references(() => comments.id),
  relatedCommunityId: integer("related_community_id").references(() => communities.id),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Report content types enum
export const reportTargetTypeEnum = pgEnum('report_target_type', [
  'post',       // Report a post
  'comment',    // Report a comment
  'user',       // Report a user
  'community',  // Report a community
]);

// Report reasons enum
export const reportReasonEnum = pgEnum('report_reason', [
  'spam',                  // Spam or misleading
  'harassment',            // Harassment or bullying
  'hate_speech',           // Hate speech
  'false_information',     // False information
  'inappropriate_content', // Inappropriate content
  'intellectual_property', // Intellectual property violation
  'violence',              // Violence or threats
  'other',                 // Other reason
]);

// Content reports
export const contentReports = pgTable("content_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(), // post, comment, user, community
  targetId: integer("target_id").notNull(),  // ID of the reported content
  reason: text("reason").notNull(),          // Reason for reporting
  description: text("description"),          // Additional details
  status: text("status").default('pending'), // pending, reviewed, actioned, dismissed
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),         // Admin notes on report
  actionTaken: text("action_taken"),         // Action taken if any
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create insert schemas for key tables
export const insertSocialProfileSchema = createInsertSchema(socialProfiles).omit({
  id: true,
  postCount: true,
  followerCount: true,
  followingCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likeCount: true,
  commentCount: true,
  shareCount: true,
  saveCount: true,
  qualityScore: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserRelationshipSchema = createInsertSchema(userRelationships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likeCount: true,
  replyCount: true,
  isVerified: true,
  verifiedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  memberCount: true,
  postCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  status: true,
  viewCount: true,
  answerCount: true,
  followCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  isAccepted: true,
  upvoteCount: true,
  downvoteCount: true,
  isVerified: true,
  verifiedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  attendeeCount: true,
  interestedCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentReportSchema = createInsertSchema(contentReports).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewNotes: true,
  actionTaken: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type SocialProfile = typeof socialProfiles.$inferSelect;
export type InsertSocialProfile = z.infer<typeof insertSocialProfileSchema>;

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;

export type CommunityMember = typeof communityMembers.$inferSelect;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type SeasonalActivity = typeof seasonalActivities.$inferSelect;

export type UserRelationship = typeof userRelationships.$inferSelect;
export type InsertUserRelationship = z.infer<typeof insertUserRelationshipSchema>;