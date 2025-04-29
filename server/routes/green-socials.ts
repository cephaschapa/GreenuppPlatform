import { Request, Response, Router, NextFunction } from "express";
import { db, pool } from "../db";
import {
  SocialProfile,
  communities,
  posts,
  comments,
  socialProfiles,
  userRelationships,
  communityMembers,
  postLikes,
  commentLikes,
  savedPosts,
  postShares,
  contentReports,
  socialNotifications,
} from "@shared/green-socials-schema";
import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { users } from "@shared/schema";
import { setupAuth } from "../auth";

// Define middleware interfaces
interface IsAuthenticatedMiddleware {
  (req: Request, res: Response, next: NextFunction): void;
}

// Create a variable to hold the middleware
let isAuthenticated: IsAuthenticatedMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

// Export the router and a function to set the middleware
export const greenSocialsRouter = Router();

// This function will be called from routes.ts to inject the correct middleware
export function setIsAuthenticatedMiddleware(
  middleware: IsAuthenticatedMiddleware,
) {
  console.log("Setting shared isAuthenticated middleware for Green Socials");
  isAuthenticated = middleware;
}

// GET /api/social/profile/:userId
// Get a social profile
greenSocialsRouter.get("/profile/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Only select columns that exist in the database
    const profile = await db
      .execute(
        sql`
      SELECT 
        sp.id, 
        sp.user_id as "userId", 
        sp.display_name as "displayName", 
        sp.bio, 
        sp.profile_image as "profileImage", 
        sp.cover_image as "coverImage", 
        sp.location, 
        sp.verification_status as "verificationStatus",
        sp.expertise,
        sp.specializations,
        sp.experience_years as "experienceYears",
        sp.follower_count as "followerCount",
        sp.following_count as "followingCount",
        sp.post_count as "postCount",
        u.id as "user_id", 
        u.username as "user_username", 
        u.first_name as "user_firstName", 
        u.last_name as "user_lastName"
      FROM social_profiles sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = ${userId}
      LIMIT 1
    `,
      )
      .then((result) => {
        if (result.rows.length === 0) return null;

        // Restructure the result to have nested user object
        const row = result.rows[0];
        return {
          profile: {
            id: row.id,
            userId: row.userId,
            displayName: row.displayName,
            bio: row.bio,
            profileImage: row.profileImage,
            coverImage: row.coverImage,
            location: row.location,
            verificationStatus: row.verificationStatus,
            expertise: row.expertise,
            specializations: row.specializations,
            experienceYears: row.experienceYears,
            followerCount: row.followerCount,
            followingCount: row.followingCount,
            postCount: row.postCount,
          },
          user: {
            id: row.user_id,
            username: row.user_username,
            firstName: row.user_firstName,
            lastName: row.user_lastName,
          },
        };
      });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/profile
// Create or update social profile
greenSocialsRouter.post("/profile", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if profile already exists using raw SQL
    const existingProfile = await db
      .execute(
        sql`
      SELECT id FROM social_profiles 
      WHERE user_id = ${userId}
      LIMIT 1
    `,
      )
      .then((result) => (result.rows.length > 0 ? result.rows[0] : null));

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await db
        .update(socialProfiles)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(socialProfiles.userId, userId))
        .returning();

      return res.json(updatedProfile[0]);
    } else {
      // Create new profile
      const newProfile = await db
        .insert(socialProfiles)
        .values({
          userId,
          displayName: req.body.displayName || req.user.username,
          bio: req.body.bio || "",
          profileImage: req.body.profileImage || req.user.profileImage,
          ...req.body,
        })
        .returning();

      return res.status(201).json(newProfile[0]);
    }
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/posts/:postId/comments
// Get comments for a specific post
greenSocialsRouter.get("/posts/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    // Get comments for the post using Drizzle query builder
    const result = await db
      .select({
        // Comment fields
        id: comments.id,
        userId: comments.userId,
        postId: comments.postId,
        parentId: comments.parentId,
        content: comments.content,
        media: comments.media,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        
        // Author fields
        author_id: users.id,
        author_username: users.username,
        author_profileImage: users.profileImage,
        
        // Profile fields
        profile_displayName: socialProfiles.displayName
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(socialProfiles, eq(comments.userId, socialProfiles.userId))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.parentId), desc(comments.createdAt));
    
    // Transform the results into the expected structure
    const formattedComments = result.map(comment => ({
      comment: {
        id: comment.id,
        userId: comment.userId,
        postId: comment.postId,
        parentId: comment.parentId,
        content: comment.content,
        media: comment.media,
        likeCount: comment.likeCount,
        replyCount: comment.replyCount,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      },
      author: {
        id: comment.author_id,
        username: comment.author_username,
        profileImage: comment.author_profileImage
      },
      profile: {
        displayName: comment.profile_displayName
      }
    }));
    
    return res.json(formattedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/feed
// Get posts for the main feed
greenSocialsRouter.get("/feed", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;

    console.log("Using Drizzle query builder API instead of raw SQL");

    try {
      // Use Drizzle's query builder API instead of raw SQL
      const result = await db
        .select({
          // Post fields
          id: posts.id,
          user_id: posts.userId,
          content: posts.content,
          post_type: posts.postType,
          visibility: posts.visibility,
          published_at: posts.publishedAt,
          community_id: posts.communityId,
          media: posts.media,
          location_name: posts.locationName,
          latitude: posts.latitude,
          longitude: posts.longitude,
          season: posts.season,
          growing_zone: posts.growingZone,
          weather_conditions: posts.weatherConditions,
          hashtags: posts.hashtags,
          mentioned_users: posts.mentionedUsers,
          crops_tags: posts.cropsTags,
          like_count: posts.likeCount,
          comment_count: posts.commentCount,
          share_count: posts.shareCount,
          
          // User fields
          author_id: users.id,
          author_username: users.username,
          author_profile_image: users.profileImage,
          
          // Profile fields (may be null)
          author_display_name: socialProfiles.displayName
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(socialProfiles, eq(posts.userId, socialProfiles.userId))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);

      // If no posts are found, return an empty array
      if (!result || result.length === 0) {
        return res.json([]);
      }

      // Transform the results into the expected structure
      const feed = await Promise.all(result.map(async (row) => {
        // Fetch comments for this post using our new endpoint
        let comments = [];
        try {
          // Get comments using raw SQL for now since we're having issues with Drizzle query builder variable names
          const commentResults = await db.execute(sql`
            SELECT 
              c.id, c.user_id as "userId", c.post_id as "postId", c.parent_id as "parentId",
              c.content, c.media, c.like_count as "likeCount", c.reply_count as "replyCount",
              c.created_at as "createdAt", c.updated_at as "updatedAt",
              u.id as "author_id", u.username as "author_username", u.profile_image as "author_profileImage",
              sp.display_name as "profile_displayName"
            FROM 
              comments c
              LEFT JOIN users u ON c.user_id = u.id
              LEFT JOIN social_profiles sp ON c.user_id = sp.user_id
            WHERE 
              c.post_id = ${row.id}
            ORDER BY 
              c.parent_id ASC, c.created_at DESC
          `);
          
          // Add debugging for comment results
          console.log(`Fetched comments for post ${row.id}:`, commentResults);
          
          // Access rows property of the result (which may be in different formats)
          const commentRows = commentResults.rows || commentResults;
          console.log(`Comment rows for post ${row.id}:`, commentRows.length, "comments found");
          
          comments = commentRows.map((comment: any) => ({
            comment: {
              id: comment.id,
              userId: comment.userId,
              postId: comment.postId,
              parentId: comment.parentId,
              content: comment.content,
              media: comment.media,
              likeCount: comment.likeCount,
              replyCount: comment.replyCount,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt
            },
            author: {
              id: comment.author_id,
              username: comment.author_username,
              profileImage: comment.author_profileImage
            },
            profile: {
              displayName: comment.profile_displayName
            }
          }));
        } catch (error) {
          console.error("Error fetching comments for post:", row.id, error);
        }

        return {
          post: {
            id: row.id,
            userId: row.user_id,
            content: row.content,
            postType: row.post_type,
            visibility: row.visibility,
            publishedAt: row.published_at,
            communityId: row.community_id,
            media: row.media,
            locationName: row.location_name,
            latitude: row.latitude,
            longitude: row.longitude,
            season: row.season,
            growingZone: row.growing_zone,
            weatherConditions: row.weather_conditions,
            hashtags: row.hashtags,
            mentionedUsers: row.mentioned_users,
            cropsTags: row.crops_tags,
            likeCount: row.like_count,
            commentCount: row.comment_count,
            shareCount: row.share_count,
            comments: comments // Include the fetched comments
          },
          author: {
            id: row.author_id,
            username: row.author_username,
            profileImage: row.author_profile_image,
          },
          profile: {
            displayName: row.author_display_name,
          },
        };
      }));

      return res.json(feed);
    } catch (queryError) {
      console.error("Error in feed query execution:", queryError);
      return res.status(500).json({ message: "Error building feed query" });
    }
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/posts
// Create a new post
greenSocialsRouter.post("/posts", isAuthenticated, async (req, res) => {
  try {
    console.log("Creating new social post");
    
    // Check for authenticated user
    if (!req.user) {
      console.error("User not authenticated in post creation");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
    
    // Log the received payload for debugging
    console.log("Received post payload:", {
      content: req.body.content,
      postType: req.body.postType,
      visibility: req.body.visibility,
      communityId: req.body.communityId,
      media: req.body.media ? JSON.stringify(req.body.media).substring(0, 100) + '...' : null,
      locationName: req.body.locationName,
      hashtags: req.body.hashtags,
      cropsTags: req.body.cropsTags,
      userId
    });

    // Special handling for media array
    if (req.body.media) {
      console.log(`Post contains ${Array.isArray(req.body.media) ? req.body.media.length : 1} media items`);
      
      if (Array.isArray(req.body.media)) {
        // Log the first media item structure
        if (req.body.media.length > 0) {
          console.log("First media item structure:", req.body.media[0]);
        }
      } else {
        console.log("Media is not an array:", typeof req.body.media);
      }
    }

    // Create post using raw SQL - only including fields that exist in the database table
    const now = new Date().toISOString();
    
    // Prepare the media for JSONB storage
    let mediaForStorage = null;
    if (req.body.media) {
      try {
        mediaForStorage = sql`${JSON.stringify(req.body.media)}::jsonb`;
        console.log("Media prepared for SQL storage as JSONB");
      } catch (error) {
        console.error("Error preparing media for storage:", error);
        // Fallback to basic storage if JSON conversion fails
        mediaForStorage = null;
      }
    }
    
    const insertResult = await db.execute(sql`
      INSERT INTO posts (
        user_id, content, post_type, visibility, community_id, media,
        location_name, latitude, longitude, season, growing_zone,
        weather_conditions, hashtags, mentioned_users, crops_tags,
        like_count, comment_count, share_count, published_at, created_at, updated_at
      ) VALUES (
        ${userId}, 
        ${req.body.content}, 
        ${req.body.postType || "text"}, 
        ${req.body.visibility || "public"}, 
        ${req.body.communityId || null}, 
        ${mediaForStorage},
        ${req.body.locationName || null}, 
        ${req.body.latitude || null}, 
        ${req.body.longitude || null}, 
        ${req.body.season || null}, 
        ${req.body.growingZone || null},
        ${req.body.weatherConditions || null}, 
        ${req.body.hashtags || null}, 
        ${req.body.mentionedUsers || null}, 
        ${req.body.cropsTags || null},
        0, 0, 0, ${now}, ${now}, ${now}
      )
      RETURNING id
    `);

    // Extract the ID of the newly created post
    const postId = insertResult.rows[0].id;

    // Get full post with user info using raw SQL
    const postResult = await db.execute(sql`
      SELECT 
        p.id, p.user_id as "userId", p.content, p.post_type as "postType", 
        p.visibility, p.published_at as "publishedAt", p.community_id as "communityId",
        p.media, p.location_name as "locationName", p.latitude, p.longitude,
        p.season, p.growing_zone as "growingZone", p.weather_conditions as "weatherConditions",
        p.hashtags, p.mentioned_users as "mentionedUsers", p.crops_tags as "cropsTags",
        p.like_count as "likeCount", p.comment_count as "commentCount", p.share_count as "shareCount",
        u.id as "author_id", u.username as "author_username", u.profile_image as "author_profileImage",
        sp.display_name as "profile_displayName"
      FROM 
        posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN social_profiles sp ON p.user_id = sp.user_id
      WHERE 
        p.id = ${postId}
      LIMIT 1
    `);

    // If post not found (unlikely since we just created it)
    if (!postResult.rows.length) {
      return res.status(500).json({ message: "Error retrieving created post" });
    }

    // Transform the raw results into the expected structure
    const postRow = postResult.rows[0];
    const post = [
      {
        post: {
          id: postRow.id,
          userId: postRow.userId,
          content: postRow.content,
          postType: postRow.postType,
          visibility: postRow.visibility,
          publishedAt: postRow.publishedAt,
          communityId: postRow.communityId,
          media: postRow.media,
          locationName: postRow.locationName,
          latitude: postRow.latitude,
          longitude: postRow.longitude,
          season: postRow.season,
          growingZone: postRow.growingZone,
          weatherConditions: postRow.weatherConditions,
          hashtags: postRow.hashtags,
          mentionedUsers: postRow.mentionedUsers,
          cropsTags: postRow.cropsTags,
          likeCount: postRow.likeCount,
          commentCount: postRow.commentCount,
          shareCount: postRow.shareCount,
        },
        author: {
          id: postRow.author_id,
          username: postRow.author_username,
          profileImage: postRow.author_profileImage,
        },
        profile: {
          displayName: postRow.profile_displayName,
        },
      },
    ];

    return res.status(201).json(post[0]);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/posts/:postId
// Get a specific post with comments
greenSocialsRouter.get("/posts/:postId", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    // Get post with user info using raw SQL
    const postResult = await db.execute(sql`
      SELECT 
        p.id, p.user_id as "userId", p.content, p.post_type as "postType", 
        p.visibility, p.published_at as "publishedAt", p.community_id as "communityId",
        p.media, p.location_name as "locationName", p.latitude, p.longitude,
        p.season, p.growing_zone as "growingZone", p.weather_conditions as "weatherConditions",
        p.hashtags, p.mentioned_users as "mentionedUsers", p.crops_tags as "cropsTags",
        p.like_count as "likeCount", p.comment_count as "commentCount", p.share_count as "shareCount",
        u.id as "author_id", u.username as "author_username", u.profile_image as "author_profileImage",
        sp.display_name as "profile_displayName"
      FROM 
        posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN social_profiles sp ON p.user_id = sp.user_id
      WHERE 
        p.id = ${postId}
      LIMIT 1
    `);

    // If post not found
    if (!postResult.rows.length) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Transform the raw results into the expected structure
    const postRow = postResult.rows[0];
    const post = [
      {
        post: {
          id: postRow.id,
          userId: postRow.userId,
          content: postRow.content,
          postType: postRow.postType,
          visibility: postRow.visibility,
          publishedAt: postRow.publishedAt,
          communityId: postRow.communityId,
          media: postRow.media,
          locationName: postRow.locationName,
          latitude: postRow.latitude,
          longitude: postRow.longitude,
          season: postRow.season,
          growingZone: postRow.growingZone,
          weatherConditions: postRow.weatherConditions,
          hashtags: postRow.hashtags,
          mentionedUsers: postRow.mentionedUsers,
          cropsTags: postRow.cropsTags,
          likeCount: postRow.likeCount,
          commentCount: postRow.commentCount,
          shareCount: postRow.shareCount,
        },
        author: {
          id: postRow.author_id,
          username: postRow.author_username,
          profileImage: postRow.author_profileImage,
        },
        profile: {
          displayName: postRow.profile_displayName,
        },
      },
    ];

    // Get comments using raw SQL
    const commentsResult = await db.execute(sql`
      SELECT 
        c.id, c.user_id as "userId", c.post_id as "postId", c.parent_id as "parentId",
        c.content, c.media, c.like_count as "likeCount", c.reply_count as "replyCount",
        c.created_at as "createdAt", c.updated_at as "updatedAt",
        u.id as "author_id", u.username as "author_username", u.profile_image as "author_profileImage",
        sp.display_name as "profile_displayName"
      FROM 
        comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN social_profiles sp ON c.user_id = sp.user_id
      WHERE 
        c.post_id = ${postId}
        AND c.parent_id IS NULL
      ORDER BY 
        c.created_at DESC
    `);

    // Transform the raw results into the expected structure
    const postComments = commentsResult.rows.map((row) => ({
      comment: {
        id: row.id,
        userId: row.userId,
        postId: row.postId,
        parentId: row.parentId,
        content: row.content,
        media: row.media,
        likeCount: row.likeCount,
        replyCount: row.replyCount,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      author: {
        id: row.author_id,
        username: row.author_username,
        profileImage: row.author_profileImage,
      },
      profile: {
        displayName: row.profile_displayName,
      },
    }));

    // Return post with comments
    return res.json({
      ...post[0],
      comments: postComments,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/comments
// Create a comment
greenSocialsRouter.post("/comments", isAuthenticated, async (req, res) => {
  try {
    // Check for authenticated user
    if (!req.user) {
      console.error("User not authenticated in comment creation");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
    console.log("Creating comment using Drizzle query builder");
    console.log("Comment data:", {
      userId,
      postId: req.body.postId,
      parentId: req.body.parentId || null,
      content: req.body.content
    });

    // Validate that we have a post ID and content
    if (!req.body.postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }
    
    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Create comment using Drizzle query builder
    const now = new Date();
    const insertResult = await db
      .insert(comments)
      .values({
        userId,
        postId: req.body.postId,
        parentId: req.body.parentId || null,
        content: req.body.content,
        media: req.body.media || null,
        likeCount: 0,
        replyCount: 0,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    // Extract the ID of the newly created comment
    const commentId = insertResult[0].id;

    // Update comment count on the post with Drizzle query builder
    await db
      .update(posts)
      .set({
        commentCount: sql`${posts.commentCount} + 1`,
        updatedAt: now
      })
      .where(eq(posts.id, req.body.postId));

    // If this is a reply, update the parent comment's reply count
    if (req.body.parentId) {
      await db
        .update(comments)
        .set({
          replyCount: sql`${comments.replyCount} + 1`,
          updatedAt: now
        })
        .where(eq(comments.id, req.body.parentId));
    }

    // Get full comment with user info using Drizzle query builder
    const commentResult = await db
      .select({
        // Comment fields
        id: comments.id,
        userId: comments.userId,
        postId: comments.postId,
        parentId: comments.parentId,
        content: comments.content,
        media: comments.media,
        likeCount: comments.likeCount,
        replyCount: comments.replyCount,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        
        // Author fields
        author_id: users.id,
        author_username: users.username,
        author_profileImage: users.profileImage,
        
        // Profile fields
        profile_displayName: socialProfiles.displayName
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(socialProfiles, eq(comments.userId, socialProfiles.userId))
      .where(eq(comments.id, commentId))
      .limit(1);

    // If comment not found (unlikely since we just created it)
    if (!commentResult.length) {
      return res.status(500).json({ message: "Error retrieving created comment" });
    }

    // Transform the result into the expected structure
    const commentRow = commentResult[0];
    const comment = {
      comment: {
        id: commentRow.id,
        userId: commentRow.userId,
        postId: commentRow.postId,
        parentId: commentRow.parentId,
        content: commentRow.content,
        media: commentRow.media,
        likeCount: commentRow.likeCount,
        replyCount: commentRow.replyCount,
        createdAt: commentRow.createdAt,
        updatedAt: commentRow.updatedAt
      },
      author: {
        id: commentRow.author_id,
        username: commentRow.author_username,
        profileImage: commentRow.author_profileImage
      },
      profile: {
        displayName: commentRow.profile_displayName
      }
    };
    
    // Get post owner to send notification
    const [postOwner] = await db
      .select({ 
        userId: posts.userId,
        postType: posts.postType
      })
      .from(posts)
      .where(eq(posts.id, req.body.postId))
      .limit(1);
      
    // Check if parent comment exists (for reply notification)
    let parentCommentOwner = null;
    if (req.body.parentId) {
      const [parent] = await db
        .select({ userId: comments.userId })
        .from(comments)
        .where(eq(comments.id, req.body.parentId))
        .limit(1);
        
      if (parent) {
        parentCommentOwner = parent.userId;
      }
    }
    
    try {
      // Import the createNotification function
      const { createNotification } = await import('../services/notifications');
      
      // Send notification to post owner if they're not the commenter
      if (postOwner && postOwner.userId !== userId) {
        const postType = postOwner.postType || 'post';
        const shortContent = commentRow.content.length > 50 
          ? commentRow.content.substring(0, 50) + "..." 
          : commentRow.content;
          
        await createNotification({
          userId: postOwner.userId,
          type: 'social_comment',
          title: 'New Comment on Your Post',
          message: `${commentRow.author_username} commented on your ${postType}: "${shortContent}"`,
          data: {
            postId: req.body.postId,
            commentId: commentId,
            commentedBy: userId,
            commentContent: shortContent
          },
          actionUrl: `/social/posts/${req.body.postId}?comment=${commentId}`,
          sendEmail: false // Set to true if you want email notifications for comments
        });
      }
      
      // Send notification to parent comment owner if this is a reply
      if (parentCommentOwner && parentCommentOwner !== userId) {
        const shortContent = commentRow.content.length > 50 
          ? commentRow.content.substring(0, 50) + "..." 
          : commentRow.content;
          
        await createNotification({
          userId: parentCommentOwner,
          type: 'social_reply',
          title: 'New Reply to Your Comment',
          message: `${commentRow.author_username} replied to your comment: "${shortContent}"`,
          data: {
            postId: req.body.postId,
            commentId: commentId,
            parentCommentId: req.body.parentId,
            repliedBy: userId,
            replyContent: shortContent
          },
          actionUrl: `/social/posts/${req.body.postId}?comment=${commentId}`,
          sendEmail: false // Set to true if you want email notifications for replies
        });
      }
    } catch (error) {
      // Just log the error, don't fail the comment creation
      console.error("Failed to create notification for comment/reply:", error);
    }

    return res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/communities
// Get list of communities
greenSocialsRouter.get("/communities", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get communities using raw SQL
    const communitiesResult = await db.execute(sql`
      SELECT 
        id, name, description, community_icon as "communityIcon", 
        cover_image as "coverImage", owner_id as "ownerId", 
        is_private as "isPrivate", member_count as "memberCount",
        category, tags, location, rules, created_at as "createdAt",
        updated_at as "updatedAt"
      FROM 
        communities
      ORDER BY 
        member_count DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    return res.json(communitiesResult.rows);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/communities/:communityId
// Get a specific community
greenSocialsRouter.get("/communities/:communityId", async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);

    // Get community with owner info using raw SQL
    const communityResult = await db.execute(sql`
      SELECT 
        c.id, c.name, c.description, c.community_icon as "communityIcon", 
        c.cover_image as "coverImage", c.owner_id as "ownerId", 
        c.is_private as "isPrivate", c.member_count as "memberCount",
        c.category, c.tags, c.location, c.rules, c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        u.id as "owner_id", u.username as "owner_username", 
        u.profile_image as "owner_profileImage"
      FROM 
        communities c
      LEFT JOIN 
        users u ON c.owner_id = u.id
      WHERE 
        c.id = ${communityId}
      LIMIT 1
    `);

    // If community not found
    if (!communityResult.rows.length) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Transform the raw results into the expected structure
    const communityRow = communityResult.rows[0];
    const community = {
      id: communityRow.id,
      name: communityRow.name,
      description: communityRow.description,
      communityIcon: communityRow.communityIcon,
      coverImage: communityRow.coverImage,
      ownerId: communityRow.ownerId,
      isPrivate: communityRow.isPrivate,
      memberCount: communityRow.memberCount,
      category: communityRow.category,
      tags: communityRow.tags,
      location: communityRow.location,
      rules: communityRow.rules,
      createdAt: communityRow.createdAt,
      updatedAt: communityRow.updatedAt,
      owner: {
        id: communityRow.owner_id,
        username: communityRow.owner_username,
        profileImage: communityRow.owner_profileImage,
      },
    };

    return res.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/communities
// Create a new community
greenSocialsRouter.post("/communities", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const now = new Date().toISOString();

    // Create community with raw SQL
    const insertResult = await db.execute(sql`
      INSERT INTO communities (
        name, description, community_icon, cover_image, owner_id,
        is_private, category, tags, location, rules, 
        member_count, created_at, updated_at
      ) VALUES (
        ${req.body.name},
        ${req.body.description || null},
        ${req.body.communityIcon || null},
        ${req.body.coverImage || null},
        ${userId},
        ${req.body.isPrivate || false},
        ${req.body.category || null},
        ${req.body.tags || null},
        ${req.body.location || null},
        ${req.body.rules || null},
        0, ${now}, ${now}
      )
      RETURNING id, name, description, community_icon as "communityIcon", 
        cover_image as "coverImage", owner_id as "ownerId", 
        is_private as "isPrivate", member_count as "memberCount",
        category, tags, location, rules, created_at as "createdAt",
        updated_at as "updatedAt"
    `);

    // Get the newly created community
    const newCommunity = insertResult.rows[0];

    // Add owner as a member with admin role using raw SQL
    await db.execute(sql`
      INSERT INTO community_members (
        community_id, user_id, role, joined_at, created_at, updated_at
      ) VALUES (
        ${newCommunity.id},
        ${userId},
        'admin',
        ${now}, ${now}, ${now}
      )
    `);

    // Update member count using raw SQL
    await db.execute(sql`
      UPDATE communities 
      SET member_count = 1, updated_at = ${now}
      WHERE id = ${newCommunity.id}
    `);

    // Set member count in the returned object as well
    newCommunity.memberCount = 1;

    return res.status(201).json(newCommunity);
  } catch (error) {
    console.error("Error creating community:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/follow/:userId
// Follow a user
greenSocialsRouter.post(
  "/follow/:userId",
  isAuthenticated,
  async (req, res) => {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const followerId = req.user.id;
    const followedId = parseInt(req.params.userId);

    console.log(
      `Follow request from user ${followerId} to follow user ${followedId}`,
    );

    try {
      // Check if already following - direct row count approach
      const checkResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM user_relationships 
          WHERE follower_id = ${followerId} 
          AND followed_id = ${followedId}`,
      );

      // Extract count, handling different return formats
      let count = 0;
      if (checkResult && checkResult.rows && checkResult.rows[0]) {
        count = parseInt(String(checkResult.rows[0].count), 10);
      } else if (
        Array.isArray(checkResult) &&
        checkResult[0] &&
        checkResult[0].count
      ) {
        count = parseInt(String(checkResult[0].count), 10);
      }

      // If already following, return success message
      if (count > 0) {
        console.log(
          `User ${followerId} is already following user ${followedId} (count: ${count})`,
        );
        return res.status(200).json({ message: "Already following this user" });
      }

      console.log(
        `Creating new relationship: ${followerId} following ${followedId}`,
      );

      // Use a transaction to ensure all operations succeed or fail together
      await db.transaction(async (tx) => {
        // Create relationship
        await tx.execute(
          sql`INSERT INTO user_relationships (follower_id, followed_id, status)
            VALUES (${followerId}, ${followedId}, 'following')
            ON CONFLICT (follower_id, followed_id) DO NOTHING`,
        );

        // Update follower count for followed user
        await tx.execute(
          sql`UPDATE social_profiles 
            SET follower_count = GREATEST(0, follower_count + 1)
            WHERE user_id = ${followedId}`,
        );

        // Update following count for follower
        await tx.execute(
          sql`UPDATE social_profiles 
            SET following_count = GREATEST(0, following_count + 1)
            WHERE user_id = ${followerId}`,
        );
      });
      
      // Get follower and followed usernames for notification
      const [follower] = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.id, followerId))
        .limit(1);
      
      try {
        // Import the createNotification function
        const { createNotification } = await import('../services/notifications');
        
        // Create a notification for the followed user
        await createNotification({
          userId: followedId,
          type: 'social_follow',
          title: 'New Follower',
          message: `${follower.username} started following you`,
          data: {
            followerId,
            followerUsername: follower.username
          },
          actionUrl: `/social/profile/${followerId}`,
          sendEmail: false // Set to true if you want email notifications for follows
        });
      } catch (error) {
        // Just log the error, don't fail the follow operation
        console.error("Failed to create notification for new follower:", error);
      }

      return res.status(201).json({ message: "User followed successfully" });
    } catch (error: any) {
      // Special handling for duplicate relationships
      if (error && error.code === "23505") {
        console.log(
          `Duplicate relationship handled: ${followerId} -> ${followedId}`,
        );
        return res.status(200).json({ message: "Already following this user" });
      }

      // Log and return any other errors
      console.error("Error following user:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/social/follow/:userId
// Unfollow a user
greenSocialsRouter.delete(
  "/follow/:userId",
  isAuthenticated,
  async (req, res) => {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const followerId = req.user.id;
    const followedId = parseInt(req.params.userId);

    console.log(
      `Unfollow request from user ${followerId} to unfollow user ${followedId}`,
    );

    try {
      // Check if following - direct row count approach
      const checkResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM user_relationships 
          WHERE follower_id = ${followerId} 
          AND followed_id = ${followedId}`,
      );

      // Extract count, handling different return formats
      let count = 0;
      if (checkResult && checkResult.rows && checkResult.rows[0]) {
        count = parseInt(String(checkResult.rows[0].count), 10);
      } else if (
        Array.isArray(checkResult) &&
        checkResult[0] &&
        checkResult[0].count
      ) {
        count = parseInt(String(checkResult[0].count), 10);
      }

      // If not following, return success message
      if (count === 0) {
        console.log(`User ${followerId} is not following user ${followedId}`);
        return res.status(200).json({ message: "Not following this user" });
      }

      console.log(
        `Deleting relationship: ${followerId} unfollowing ${followedId}`,
      );

      // Use a transaction to ensure all operations succeed or fail together
      await db.transaction(async (tx) => {
        // Delete relationship
        await tx.execute(
          sql`DELETE FROM user_relationships 
            WHERE follower_id = ${followerId} 
            AND followed_id = ${followedId}`,
        );

        // Update follower count for followed user
        await tx.execute(
          sql`UPDATE social_profiles 
            SET follower_count = GREATEST(follower_count - 1, 0)
            WHERE user_id = ${followedId}`,
        );

        // Update following count for follower
        await tx.execute(
          sql`UPDATE social_profiles 
            SET following_count = GREATEST(following_count - 1, 0)
            WHERE user_id = ${followerId}`,
        );
      });

      return res.status(200).json({ message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// GET /api/social/following
// Get users that the current user follows
greenSocialsRouter.get("/following", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get relationships with user and profile info using Drizzle query builder
    console.log(`Fetching following list for user ${userId} using Drizzle query builder`);

    // First get relationship IDs for debugging
    const relationshipCount = await db
      .select({count: sql`count(*)`})
      .from(userRelationships)
      .where(eq(userRelationships.followerId, userId));
      
    console.log(`DEBUG: Found ${relationshipCount[0].count} following users`);

    // Get relationships with user profiles using Drizzle query builder
    const following = await db
      .select({
        relationshipId: userRelationships.id,
        relationshipStatus: userRelationships.status,
        relationshipCreatedAt: userRelationships.createdAt,
        userId: users.id,
        username: users.username,
        profileImage: sql`COALESCE(${users.profileImage}, '')`,
        displayName: sql`COALESCE(${socialProfiles.displayName}, ${users.username})`,
        bio: sql`COALESCE(${socialProfiles.bio}, '')`,
        expertise: socialProfiles.expertise,
        specializations: socialProfiles.specializations,
        location: sql`COALESCE(${socialProfiles.location}, '')`,
        verificationStatus: sql`COALESCE(${socialProfiles.verificationStatus}, 'unverified')`,
        experienceYears: socialProfiles.experienceYears,
        badges: socialProfiles.badges,
        followerCount: sql`COALESCE(${socialProfiles.followerCount}, 0)`,
        followingCount: sql`COALESCE(${socialProfiles.followingCount}, 0)`
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.followedId, users.id))
      .leftJoin(socialProfiles, eq(users.id, socialProfiles.userId))
      .where(eq(userRelationships.followerId, userId))
      .orderBy(desc(userRelationships.createdAt))
      .limit(limit)
      .offset(offset);

    console.log(`DEBUG: Found ${following.length} following users`);

    console.log("DEBUG: Formatted following:", JSON.stringify(following));

    return res.json(following);
  } catch (error) {
    console.error("Error fetching following users:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/followers
// Get users who follow the current user
greenSocialsRouter.get("/followers", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get relationships with user and profile info using direct SQL
    const followers = await db.execute(
      sql`SELECT 
            ur.id as "relationshipId", 
            ur.status as "relationshipStatus",
            ur.created_at as "relationshipCreatedAt",
            u.id as "userId",
            u.username,
            u.profile_image as "profileImage",
            sp.display_name as "displayName",
            sp.bio,
            sp.expertise,
            sp.location,
            sp.verification_status as "verificationStatus",
            sp.experience_years as "experienceYears",
            sp.specializations,
            sp.badges
          FROM user_relationships ur
          INNER JOIN users u ON ur.follower_id = u.id
          LEFT JOIN social_profiles sp ON u.id = sp.user_id
          WHERE ur.followed_id = ${userId}
          ORDER BY ur.created_at DESC
          LIMIT ${limit} OFFSET ${offset}`,
    );

    return res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/suggested
// Get suggested users to follow
greenSocialsRouter.get("/suggested", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;

    console.log(`DEBUG: Looking for users that are not user id ${userId}`);

    // Get all followed IDs for filtering
    console.log(`Getting followed user IDs for user ${userId}`);
    const followedResult = await db.execute(
      sql`SELECT followed_id FROM user_relationships WHERE follower_id = ${userId}`,
    );

    // Extract the followed IDs more carefully and convert to integers
    const followedUserIds = [userId]; // Always exclude current user
    if (followedResult && followedResult.rows) {
      followedResult.rows.forEach((row: any) => {
        if (row && row.followed_id) {
          followedUserIds.push(parseInt(String(row.followed_id), 10));
        }
      });
    } else if (Array.isArray(followedResult)) {
      followedResult.forEach((row: any) => {
        if (row && row.followed_id) {
          followedUserIds.push(parseInt(String(row.followed_id), 10));
        }
      });
    }

    console.log(`User ${userId} is following these users:`, followedUserIds);

    // Format the followed IDs for the SQL NOT IN clause
    const followedIdsStringForSql = followedUserIds.join(",") || "0";

    // Get only users that have profiles and are not already followed
    console.log(`Getting users not in: ${followedIdsStringForSql}`);
    const suggestedUsers = await db.execute(
      sql`SELECT 
            u.id as "userId", 
            u.username,
            COALESCE(u.profile_image, '') as "profileImage",
            COALESCE(sp.display_name, u.username) as "displayName",
            COALESCE(sp.bio, '') as "bio",
            sp.expertise,
            sp.specializations,
            COALESCE(sp.location, '') as "location",
            COALESCE(sp.verification_status, 'unverified') as "verificationStatus",
            COALESCE(sp.follower_count, 0) as "followerCount",
            COALESCE(sp.following_count, 0) as "followingCount"
          FROM users u
          JOIN social_profiles sp ON u.id = sp.user_id
          WHERE u.id NOT IN (${sql.raw(followedIdsStringForSql)})
          LIMIT ${limit}`,
    );

    // Format the response consistently
    const formattedResults = [];
    if (
      suggestedUsers &&
      suggestedUsers.rows &&
      suggestedUsers.rows.length > 0
    ) {
      formattedResults.push(...suggestedUsers.rows);
    } else if (Array.isArray(suggestedUsers) && suggestedUsers.length > 0) {
      formattedResults.push(...suggestedUsers);
    }

    console.log(
      `Found ${formattedResults.length} suggested users after filtering`,
    );

    // Return the formatted results from our direct approach
    console.log(
      `DEBUG: Found ${formattedResults.length} users to suggest after filtering`,
    );
    console.log("Formatted results:", JSON.stringify(formattedResults));

    return res.json(formattedResults);
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/activity
// Get recent activity from followed users
greenSocialsRouter.get("/activity", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get users that this user follows using SQL
    const followingResult = await db.execute(
      sql`SELECT followed_id FROM user_relationships WHERE follower_id = ${userId}`,
    );

    const followedIds: number[] = [];

    // Handle results safely
    if (Array.isArray(followingResult)) {
      followingResult.forEach((row: any) => {
        if (row && row.followed_id) {
          followedIds.push(row.followed_id);
        }
      });
    }

    if (followedIds.length === 0) {
      return res.json([]);
    }

    const followedIdsString = followedIds.join(",");

    // Get recent posts and comments in one query, ordered by date
    const activityResult = await db.execute(
      sql`(
        SELECT 
          'post' as "type",
          p.id,
          p.content,
          p.created_at as "createdAt",
          u.id as "userId",
          u.username,
          u.profile_image as "profileImage",
          sp.display_name as "displayName"
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN social_profiles sp ON u.id = sp.user_id
        WHERE p.user_id IN (${sql.raw(followedIdsString)})
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      )
      UNION ALL
      (
        SELECT 
          'comment' as "type",
          c.id,
          c.content,
          c.created_at as "createdAt",
          c.post_id as "postId",
          u.id as "userId",
          u.username,
          u.profile_image as "profileImage",
          sp.display_name as "displayName"
        FROM comments c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN social_profiles sp ON u.id = sp.user_id
        WHERE c.user_id IN (${sql.raw(followedIdsString)})
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      )
      ORDER BY "createdAt" DESC
      LIMIT ${limit}`,
    );

    return res.json(activityResult);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/expertise-categories
// Get expertise categories with user counts
greenSocialsRouter.get("/expertise-categories", async (req, res) => {
  try {
    // This is a simplified approach - in a real app, you'd likely
    // have a separate table for categories with standardized names
    const categories = [
      {
        id: 1,
        name: "Crop Specialists",
        icon: "crop",
        color: "green-600",
        count: 64,
      },
      {
        id: 2,
        name: "Organic Farming",
        icon: "sprout",
        color: "green-600",
        count: 38,
      },
      {
        id: 3,
        name: "Climate Smart",
        icon: "cloud",
        color: "blue-500",
        count: 27,
      },
      {
        id: 4,
        name: "Agro Dealers",
        icon: "shopping-bag",
        color: "orange-500",
        count: 41,
      },
    ];

    return res.json(categories);
  } catch (error) {
    console.error("Error fetching expertise categories:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Test endpoint
greenSocialsRouter.get("/test", (req, res) => {
  return res.json({ message: "Green Socials API is working!" });
});

// POST /api/social/posts/:postId/like
// Like a post
greenSocialsRouter.post(
  "/posts/:postId/like",
  isAuthenticated,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = parseInt(req.params.postId);

      // Check if the post exists
      const postExists = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!postExists.length) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the user already liked the post
      const existingLike = await db
        .select({ id: postLikes.id })
        .from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        .limit(1);

      if (existingLike.length) {
        return res.status(400).json({ message: "You already liked this post" });
      }

      // Create the like
      await db.insert(postLikes).values({
        postId,
        userId,
      });

      // Increment the post's like count
      await db
        .update(posts)
        .set({
          likeCount: sql`${posts.likeCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));

      // Create a notification for the post owner
      const postOwnerResult = await db
        .select({ 
          userId: posts.userId, 
          content: posts.content,
          postType: posts.postType
        })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (postOwnerResult.length && postOwnerResult[0].userId !== userId) {
        // Get the liker's username
        const [liker] = await db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        const postOwner = postOwnerResult[0];
        const shortContent =
          postOwner.content.length > 50
            ? postOwner.content.substring(0, 50) + "..."
            : postOwner.content;
            
        const postType = postOwner.postType || 'post';

        // Import the createNotification function
        const { createNotification } = await import('../services/notifications');
        
        try {
          // Create a notification using the notification service
          await createNotification({
            userId: postOwner.userId,
            type: 'social_like',
            title: 'New Like on Your Post',
            message: `${liker.username} liked your ${postType}: "${shortContent}"`,
            data: {
              postId,
              likedBy: userId,
              postContent: shortContent
            },
            actionUrl: `/social/posts/${postId}`,
            sendEmail: false // Set to true if you want email notifications for likes
          });
        } catch (error) {
          // Just log the error, don't fail the like operation
          console.error("Failed to create notification for post like:", error);
        }
      }

      return res.status(200).json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/social/posts/:postId/like
// Unlike a post
greenSocialsRouter.delete(
  "/posts/:postId/like",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const postId = parseInt(req.params.postId);
      const now = new Date().toISOString();

      // Check if the like exists using raw SQL
      const likeCheckResult = await db.execute(sql`
      SELECT id FROM post_likes 
      WHERE post_id = ${postId} AND user_id = ${userId}
      LIMIT 1
    `);

      if (!likeCheckResult.rows.length) {
        return res.status(404).json({ message: "Like not found" });
      }

      // Delete the like using raw SQL
      await db.execute(sql`
      DELETE FROM post_likes
      WHERE post_id = ${postId} AND user_id = ${userId}
    `);

      // Decrement the post's like count using raw SQL
      await db.execute(sql`
      UPDATE posts
      SET like_count = GREATEST(like_count - 1, 0),
          updated_at = ${now}
      WHERE id = ${postId}
    `);

      return res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// POST /api/social/comments/:commentId/like
// Like a comment
greenSocialsRouter.post(
  "/comments/:commentId/like",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const commentId = parseInt(req.params.commentId);
      const now = new Date().toISOString();

      // Check if the comment exists using raw SQL
      const commentCheckResult = await db.execute(sql`
      SELECT id, user_id as "userId", post_id as "postId" 
      FROM comments
      WHERE id = ${commentId}
      LIMIT 1
    `);

      if (!commentCheckResult.rows.length) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const commentData = commentCheckResult.rows[0];

      // Check if the user already liked the comment using raw SQL
      const likeCheckResult = await db.execute(sql`
      SELECT id FROM comment_likes
      WHERE comment_id = ${commentId} AND user_id = ${userId}
      LIMIT 1
    `);

      if (likeCheckResult.rows.length) {
        return res
          .status(400)
          .json({ message: "You already liked this comment" });
      }

      // Create the like using raw SQL
      await db.execute(sql`
      INSERT INTO comment_likes (comment_id, user_id, created_at)
      VALUES (${commentId}, ${userId}, ${now})
    `);

      // Increment the comment's like count using raw SQL
      await db.execute(sql`
      UPDATE comments
      SET like_count = like_count + 1,
          updated_at = ${now}
      WHERE id = ${commentId}
    `);

      // Create a notification for the comment owner
      if (commentData.userId !== userId) {
        // Get comment content for notification using raw SQL
        const commentContentResult = await db.execute(sql`
        SELECT content FROM comments
        WHERE id = ${commentId}
        LIMIT 1
      `);

        if (commentContentResult.rows.length) {
          // Get the liker's username
          const [liker] = await db
            .select({ username: users.username })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
            
          const commentContent = commentContentResult.rows[0].content;
          const shortContent =
            commentContent.length > 50
              ? commentContent.substring(0, 50) + "..."
              : commentContent;

          // Import the createNotification function
          const { createNotification } = await import('../services/notifications');
          
          try {
            // Create a notification using the notification service
            await createNotification({
              userId: commentData.userId,
              type: 'social_like',
              title: 'New Like on Your Comment',
              message: `${liker.username} liked your comment: "${shortContent}"`,
              data: {
                commentId,
                postId: commentData.postId,
                likedBy: userId,
                commentContent: shortContent
              },
              actionUrl: `/social/posts/${commentData.postId}?comment=${commentId}`,
              sendEmail: false // Set to true if you want email notifications for comment likes
            });
          } catch (error) {
            // Just log the error, don't fail the like operation
            console.error("Failed to create notification for comment like:", error);
          }
        }
      }

      return res.status(200).json({ message: "Comment liked successfully" });
    } catch (error) {
      console.error("Error liking comment:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/social/comments/:commentId/like
// Unlike a comment
greenSocialsRouter.delete(
  "/comments/:commentId/like",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const commentId = parseInt(req.params.commentId);
      const now = new Date().toISOString();

      // Check if the like exists using raw SQL
      const likeCheckResult = await db.execute(sql`
      SELECT id FROM comment_likes
      WHERE comment_id = ${commentId} AND user_id = ${userId}
      LIMIT 1
    `);

      if (!likeCheckResult.rows.length) {
        return res.status(404).json({ message: "Like not found" });
      }

      // Delete the like using raw SQL
      await db.execute(sql`
      DELETE FROM comment_likes
      WHERE comment_id = ${commentId} AND user_id = ${userId}
    `);

      // Decrement the comment's like count using raw SQL
      await db.execute(sql`
      UPDATE comments
      SET like_count = GREATEST(like_count - 1, 0),
          updated_at = ${now}
      WHERE id = ${commentId}
    `);

      return res.status(200).json({ message: "Comment unliked successfully" });
    } catch (error) {
      console.error("Error unliking comment:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// POST /api/social/posts/:postId/share
// Share a post
greenSocialsRouter.post(
  "/posts/:postId/share",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const postId = parseInt(req.params.postId);
      const { targetType, targetId, externalPlatform } = req.body;
      const now = new Date().toISOString();

      // Check if the post exists using raw SQL
      const postCheckResult = await db.execute(sql`
        SELECT id, user_id as "userId", content 
        FROM posts 
        WHERE id = ${postId}
        LIMIT 1
      `);

      if (!postCheckResult.rows.length) {
        return res.status(404).json({ message: "Post not found" });
      }

      const postData = postCheckResult.rows[0];

      // Create the share using raw SQL
      const shareResult = await db.execute(sql`
        INSERT INTO post_shares (
          post_id, user_id, target_type, 
          target_id, external_platform, created_at
        )
        VALUES (
          ${postId}, ${userId}, ${targetType || null}, 
          ${targetId || null}, ${externalPlatform || null}, ${now}
        )
        RETURNING id, post_id as "postId", user_id as "userId", 
                  target_type as "targetType", target_id as "targetId", 
                  external_platform as "externalPlatform", created_at as "createdAt"
      `);

      // Increment the post's share count using raw SQL
      await db.execute(sql`
        UPDATE posts
        SET share_count = share_count + 1,
            updated_at = ${now}
        WHERE id = ${postId}
      `);

      // Create a notification for the post owner
      if (postData.userId !== userId) {
        // Get the sharer's username
        const [sharer] = await db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
            
        const content = postData.content || "";
        const shortContent = typeof content === 'string' && content.length > 50 
          ? content.substring(0, 50) + "..." 
          : String(content);

        let shareType = "their profile";
        if (targetType === "community") {
          shareType = "a community";
        } else if (targetType === "external") {
          shareType = externalPlatform || "an external platform";
        }

        try {
          // Import the createNotification function
          const { createNotification } = await import('../services/notifications');
          
          // Create a notification using the notification service
          await createNotification({
            userId: postData.userId,
            type: 'social_like', // You can create a separate 'social_share' type if needed
            title: 'Your Post Was Shared',
            message: `${sharer.username} shared your post to ${shareType}: "${shortContent}"`,
            data: {
              postId,
              sharedBy: userId,
              targetType,
              targetId,
              externalPlatform,
              postContent: shortContent
            },
            actionUrl: `/social/posts/${postId}`,
            sendEmail: false // Set to true if you want email notifications for shares
          });
        } catch (error) {
          // Just log the error, don't fail the share operation
          console.error("Failed to create notification for post share:", error);
        }
      }

      return res.status(201).json(shareResult.rows[0]);
    } catch (error) {
      console.error("Error sharing post:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// POST /api/social/posts/:postId/report
// Report a post
greenSocialsRouter.post(
  "/posts/:postId/report",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const reporterId = req.user.id;
      const postId = parseInt(req.params.postId);
      const { reason, description } = req.body;
      const now = new Date().toISOString();

      // Check if the post exists using raw SQL
      const postCheckResult = await db.execute(sql`
      SELECT id FROM posts 
      WHERE id = ${postId}
      LIMIT 1
    `);

      if (!postCheckResult.rows.length) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the user already reported this post using raw SQL
      const reportCheckResult = await db.execute(sql`
      SELECT id FROM content_reports
      WHERE reporter_id = ${reporterId} 
        AND target_type = 'post' 
        AND target_id = ${postId}
      LIMIT 1
    `);

      if (reportCheckResult.rows.length) {
        return res
          .status(400)
          .json({ message: "You already reported this post" });
      }

      // Create the report using raw SQL
      const reportResult = await db.execute(sql`
      INSERT INTO content_reports (
        reporter_id, target_type, target_id, 
        reason, description, created_at
      )
      VALUES (
        ${reporterId}, 'post', ${postId}, 
        ${reason || null}, ${description || null}, ${now}
      )
      RETURNING id
    `);

      return res.status(201).json({
        message: "Report submitted successfully",
        id: reportResult.rows[0].id,
      });
    } catch (error) {
      console.error("Error reporting post:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// POST /api/social/comments/:commentId/report
// Report a comment
greenSocialsRouter.post(
  "/comments/:commentId/report",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const reporterId = req.user.id;
      const commentId = parseInt(req.params.commentId);
      const { reason, description } = req.body;
      const now = new Date().toISOString();

      // Check if the comment exists using raw SQL
      const commentCheckResult = await db.execute(sql`
      SELECT id FROM comments 
      WHERE id = ${commentId}
      LIMIT 1
    `);

      if (!commentCheckResult.rows.length) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user already reported this comment using raw SQL
      const reportCheckResult = await db.execute(sql`
      SELECT id FROM content_reports
      WHERE reporter_id = ${reporterId} 
        AND target_type = 'comment' 
        AND target_id = ${commentId}
      LIMIT 1
    `);

      if (reportCheckResult.rows.length) {
        return res
          .status(400)
          .json({ message: "You already reported this comment" });
      }

      // Create the report using raw SQL
      const reportResult = await db.execute(sql`
      INSERT INTO content_reports (
        reporter_id, target_type, target_id, 
        reason, description, created_at
      )
      VALUES (
        ${reporterId}, 'comment', ${commentId}, 
        ${reason || null}, ${description || null}, ${now}
      )
      RETURNING id
    `);

      return res.status(201).json({
        message: "Report submitted successfully",
        id: reportResult.rows[0].id,
      });
    } catch (error) {
      console.error("Error reporting comment:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// POST /api/social/posts/:postId/save
// Save a post (bookmark)
greenSocialsRouter.post(
  "/posts/:postId/save",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const postId = parseInt(req.params.postId);
      const { collectionName } = req.body;
      const collection = collectionName || "Saved";
      const now = new Date().toISOString();

      // Check if the post exists using raw SQL
      const postCheckResult = await db.execute(sql`
      SELECT id, user_id as "userId", content, post_type as "postType"
      FROM posts 
      WHERE id = ${postId}
      LIMIT 1
    `);

      if (!postCheckResult.rows.length) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const postData = postCheckResult.rows[0];

      // Check if the user already saved this post using raw SQL
      const saveCheckResult = await db.execute(sql`
      SELECT id FROM saved_posts
      WHERE user_id = ${userId} AND post_id = ${postId}
      LIMIT 1
    `);

      if (saveCheckResult.rows.length) {
        return res.status(400).json({ message: "You already saved this post" });
      }

      // Create the save using raw SQL
      const saveResult = await db.execute(sql`
      INSERT INTO saved_posts (user_id, post_id, collection_name, created_at)
      VALUES (${userId}, ${postId}, ${collection}, ${now})
      RETURNING id, user_id as "userId", post_id as "postId", collection_name as "collectionName", created_at as "createdAt"
    `);

      // Update the post's updated timestamp using raw SQL
      // Note: saveCount field doesn't exist in the database table
      await db.execute(sql`
      UPDATE posts
      SET updated_at = ${now}
      WHERE id = ${postId}
    `);
      
      // Send notification to post owner if they're different than the saver
      if (postData.userId !== userId) {
        // Get the user who is saving the post
        const [saver] = await db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
            
        const content = postData.content || "";
        const shortContent = typeof content === 'string' && content.length > 50 
          ? content.substring(0, 50) + "..." 
          : String(content);
          
        const postType = postData.postType || 'post';

        try {
          // Import the createNotification function
          const { createNotification } = await import('../services/notifications');
          
          // Create a notification using the notification service
          await createNotification({
            userId: postData.userId,
            type: 'social_save',
            title: 'Your Post Was Saved',
            message: `${saver.username} saved your ${postType}: "${shortContent}"`,
            data: {
              postId,
              savedBy: userId,
              collection,
              postContent: shortContent
            },
            actionUrl: `/social/posts/${postId}`,
            sendEmail: false // Set to true if you want email notifications for saved posts
          });
        } catch (error) {
          // Just log the error, don't fail the save operation
          console.error("Failed to create notification for post save:", error);
        }
      }

      return res.status(201).json(saveResult.rows[0]);
    } catch (error) {
      console.error("Error saving post:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/social/posts/:postId/save
// Unsave a post (remove bookmark)
greenSocialsRouter.delete(
  "/posts/:postId/save",
  isAuthenticated,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const postId = parseInt(req.params.postId);
      const now = new Date().toISOString();

      // Check if the save exists using raw SQL
      const saveCheckResult = await db.execute(sql`
      SELECT id FROM saved_posts
      WHERE user_id = ${userId} AND post_id = ${postId}
      LIMIT 1
    `);

      if (!saveCheckResult.rows.length) {
        return res.status(404).json({ message: "Saved post not found" });
      }

      const savedPostId = saveCheckResult.rows[0].id;

      // Delete the save using raw SQL
      await db.execute(sql`
      DELETE FROM saved_posts
      WHERE id = ${savedPostId}
    `);

      // Update the post's updated timestamp using raw SQL
      await db.execute(sql`
      UPDATE posts
      SET updated_at = ${now}
      WHERE id = ${postId}
    `);

      return res.status(200).json({ message: "Post unsaved successfully" });
    } catch (error) {
      console.error("Error unsaving post:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);
