import { Request, Response, Router } from "express";
import { db } from "../db";
import { 
  SocialProfile, 
  communities, 
  posts, 
  comments, 
  socialProfiles, 
  userRelationships,
  communityMembers
} from "@shared/green-socials-schema";
import { and, desc, eq, inArray, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { users } from "@shared/schema";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

export const greenSocialsRouter = Router();

// GET /api/social/profile/:userId
// Get a social profile
greenSocialsRouter.get("/profile/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get the profile with user details
    const profile = await db.query.socialProfiles.findFirst({
      where: eq(socialProfiles.userId, userId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        }
      }
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
    
    // Check if profile already exists
    const existingProfile = await db.query.socialProfiles.findFirst({
      where: eq(socialProfiles.userId, userId)
    });
    
    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await db
        .update(socialProfiles)
        .set({
          ...req.body,
          updatedAt: new Date()
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
          ...req.body
        })
        .returning();
      
      return res.status(201).json(newProfile[0]);
    }
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/social/feed
// Get posts for the main feed
greenSocialsRouter.get("/feed", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const before = req.query.before as string;
    
    // Get users that this user follows
    const following = await db.query.userRelationships.findMany({
      where: eq(userRelationships.followerId, userId),
      columns: {
        followedId: true
      }
    });
    
    const followingIds = following.map(f => f.followedId);
    // Add current user to see their own posts
    followingIds.push(userId);
    
    // Get communities this user belongs to
    const communities = await db.query.communityMembers.findMany({
      where: and(
        eq(communityMembers.userId, userId),
        eq(communityMembers.isActive, true)
      ),
      columns: {
        communityId: true
      }
    });
    
    const communityIds = communities.map(c => c.communityId);
    
    // Build query based on pagination
    let query = db.select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        profileImage: users.profileImage
      },
      profile: {
        displayName: socialProfiles.displayName
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(socialProfiles, eq(posts.userId, socialProfiles.userId))
    .where(
      and(
        // Post from followed user OR community post from joined community OR public post
        or(
          inArray(posts.userId, followingIds),
          inArray(posts.communityId, communityIds),
          eq(posts.visibility, 'public')
        ),
        // Pagination - get posts before a certain ID
        before ? lt(posts.id, parseInt(before)) : isNotNull(posts.id)
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
    
    const feed = await query;
    
    return res.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/posts
// Create a new post
greenSocialsRouter.post("/posts", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create post
    const newPost = await db
      .insert(posts)
      .values({
        userId,
        content: req.body.content,
        postType: req.body.postType || 'text',
        visibility: req.body.visibility || 'public',
        communityId: req.body.communityId,
        media: req.body.media,
        locationName: req.body.locationName,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        season: req.body.season,
        growingZone: req.body.growingZone,
        weatherConditions: req.body.weatherConditions,
        hashtags: req.body.hashtags,
        mentionedUsers: req.body.mentionedUsers,
        cropsTags: req.body.cropsTags,
      })
      .returning();
    
    // Get full post with user info
    const post = await db.select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        profileImage: users.profileImage
      },
      profile: {
        displayName: socialProfiles.displayName
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(socialProfiles, eq(posts.userId, socialProfiles.userId))
    .where(eq(posts.id, newPost[0].id))
    .limit(1);
    
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
    
    // Get post with user info
    const post = await db.select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        profileImage: users.profileImage
      },
      profile: {
        displayName: socialProfiles.displayName
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(socialProfiles, eq(posts.userId, socialProfiles.userId))
    .where(eq(posts.id, postId))
    .limit(1);
    
    if (!post.length) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Get comments
    const postComments = await db.select({
      comment: comments,
      author: {
        id: users.id,
        username: users.username,
        profileImage: users.profileImage
      },
      profile: {
        displayName: socialProfiles.displayName
      }
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(socialProfiles, eq(comments.userId, socialProfiles.userId))
    .where(
      and(
        eq(comments.postId, postId),
        isNull(comments.parentId) // Only get top-level comments
      )
    )
    .orderBy(desc(comments.createdAt));
    
    // Return post with comments
    return res.json({
      ...post[0],
      comments: postComments
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
    const userId = req.user.id;
    
    // Create comment
    const newComment = await db
      .insert(comments)
      .values({
        userId,
        postId: req.body.postId,
        parentId: req.body.parentId || null,
        content: req.body.content,
        media: req.body.media
      })
      .returning();
    
    // Update comment count on the post
    await db
      .update(posts)
      .set({
        commentCount: sql`${posts.commentCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, req.body.postId));
    
    // If this is a reply, update the parent comment's reply count
    if (req.body.parentId) {
      await db
        .update(comments)
        .set({
          replyCount: sql`${comments.replyCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(comments.id, req.body.parentId));
    }
    
    // Get full comment with user info
    const comment = await db.select({
      comment: comments,
      author: {
        id: users.id,
        username: users.username,
        profileImage: users.profileImage
      },
      profile: {
        displayName: socialProfiles.displayName
      }
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(socialProfiles, eq(comments.userId, socialProfiles.userId))
    .where(eq(comments.id, newComment[0].id))
    .limit(1);
    
    return res.status(201).json(comment[0]);
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
    
    const communitiesList = await db
      .select()
      .from(communities)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(communities.memberCount));
    
    return res.json(communitiesList);
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
    
    const community = await db.query.communities.findFirst({
      where: eq(communities.id, communityId),
      with: {
        owner: {
          columns: {
            id: true,
            username: true,
            profileImage: true
          }
        }
      }
    });
    
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    
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
    const userId = req.user.id;
    
    // Create community
    const newCommunity = await db
      .insert(communities)
      .values({
        name: req.body.name,
        description: req.body.description,
        communityIcon: req.body.communityIcon,
        coverImage: req.body.coverImage,
        ownerId: userId,
        isPrivate: req.body.isPrivate || false,
        category: req.body.category,
        tags: req.body.tags,
        location: req.body.location,
        rules: req.body.rules
      })
      .returning();
    
    // Add owner as a member with admin role
    await db.insert(communityMembers).values({
      communityId: newCommunity[0].id,
      userId,
      role: 'admin'
    });
    
    // Update member count
    await db
      .update(communities)
      .set({ memberCount: 1 })
      .where(eq(communities.id, newCommunity[0].id));
    
    return res.status(201).json(newCommunity[0]);
  } catch (error) {
    console.error("Error creating community:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/follow/:userId
// Follow a user
greenSocialsRouter.post("/follow/:userId", isAuthenticated, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = parseInt(req.params.userId);
    
    // Check if already following
    const existingRelationship = await db.query.userRelationships.findFirst({
      where: and(
        eq(userRelationships.followerId, followerId),
        eq(userRelationships.followedId, followedId)
      )
    });
    
    if (existingRelationship) {
      return res.status(400).json({ message: "Already following this user" });
    }
    
    // Create relationship
    await db.insert(userRelationships).values({
      followerId,
      followedId,
      status: 'following'
    });
    
    // Update follower count for followed user
    await db
      .update(socialProfiles)
      .set({ followerCount: sql`${socialProfiles.followerCount} + 1` })
      .where(eq(socialProfiles.userId, followedId));
    
    // Update following count for follower
    await db
      .update(socialProfiles)
      .set({ followingCount: sql`${socialProfiles.followingCount} + 1` })
      .where(eq(socialProfiles.userId, followerId));
    
    return res.status(201).json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/social/follow/:userId
// Unfollow a user
greenSocialsRouter.delete("/follow/:userId", isAuthenticated, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = parseInt(req.params.userId);
    
    // Check if following
    const existingRelationship = await db.query.userRelationships.findFirst({
      where: and(
        eq(userRelationships.followerId, followerId),
        eq(userRelationships.followedId, followedId)
      )
    });
    
    if (!existingRelationship) {
      return res.status(400).json({ message: "Not following this user" });
    }
    
    // Delete relationship
    await db
      .delete(userRelationships)
      .where(
        and(
          eq(userRelationships.followerId, followerId),
          eq(userRelationships.followedId, followedId)
        )
      );
    
    // Update follower count for followed user
    await db
      .update(socialProfiles)
      .set({ followerCount: sql`${socialProfiles.followerCount} - 1` })
      .where(eq(socialProfiles.userId, followedId));
    
    // Update following count for follower
    await db
      .update(socialProfiles)
      .set({ followingCount: sql`${socialProfiles.followingCount} - 1` })
      .where(eq(socialProfiles.userId, followerId));
    
    return res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Test endpoint
greenSocialsRouter.get("/test", (req, res) => {
  return res.json({ message: "Green Socials API is working!" });
});