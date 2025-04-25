import { Request, Response, Router } from "express";
import { db } from "../db";
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
  socialNotifications
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
    
    // Create post - only including fields that exist in the database table
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
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        // Don't include saveCount as it doesn't exist in the database table
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
  // Check authentication
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const followerId = req.user.id;
  const followedId = parseInt(req.params.userId);
  
  console.log(`Follow request from user ${followerId} to follow user ${followedId}`);
  
  try {
    // Check if already following - direct row count approach
    const checkResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM user_relationships 
          WHERE follower_id = ${followerId} 
          AND followed_id = ${followedId}`
    );
    
    // Extract count, handling different return formats
    let count = 0;
    if (checkResult && checkResult.rows && checkResult.rows[0]) {
      count = parseInt(String(checkResult.rows[0].count), 10);
    } else if (Array.isArray(checkResult) && checkResult[0] && checkResult[0].count) {
      count = parseInt(String(checkResult[0].count), 10);
    }
    
    // If already following, return success message
    if (count > 0) {
      console.log(`User ${followerId} is already following user ${followedId} (count: ${count})`);
      return res.status(200).json({ message: "Already following this user" });
    }
    
    console.log(`Creating new relationship: ${followerId} following ${followedId}`);
    
    // Use a transaction to ensure all operations succeed or fail together
    await db.transaction(async (tx) => {
      // Create relationship
      await tx.execute(
        sql`INSERT INTO user_relationships (follower_id, followed_id, status)
            VALUES (${followerId}, ${followedId}, 'following')
            ON CONFLICT (follower_id, followed_id) DO NOTHING`
      );
      
      // Update follower count for followed user
      await tx.execute(
        sql`UPDATE social_profiles 
            SET follower_count = GREATEST(0, follower_count + 1)
            WHERE user_id = ${followedId}`
      );
      
      // Update following count for follower
      await tx.execute(
        sql`UPDATE social_profiles 
            SET following_count = GREATEST(0, following_count + 1)
            WHERE user_id = ${followerId}`
      );
    });
    
    return res.status(201).json({ message: "User followed successfully" });
    
  } catch (error: any) {
    // Special handling for duplicate relationships
    if (error && error.code === '23505') {
      console.log(`Duplicate relationship handled: ${followerId} -> ${followedId}`);
      return res.status(200).json({ message: "Already following this user" });
    }
    
    // Log and return any other errors
    console.error("Error following user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/social/follow/:userId
// Unfollow a user
greenSocialsRouter.delete("/follow/:userId", isAuthenticated, async (req, res) => {
  // Check authentication
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const followerId = req.user.id;
  const followedId = parseInt(req.params.userId);
  
  console.log(`Unfollow request from user ${followerId} to unfollow user ${followedId}`);
  
  try {
    // Check if following - direct row count approach
    const checkResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM user_relationships 
          WHERE follower_id = ${followerId} 
          AND followed_id = ${followedId}`
    );
    
    // Extract count, handling different return formats
    let count = 0;
    if (checkResult && checkResult.rows && checkResult.rows[0]) {
      count = parseInt(String(checkResult.rows[0].count), 10);
    } else if (Array.isArray(checkResult) && checkResult[0] && checkResult[0].count) {
      count = parseInt(String(checkResult[0].count), 10);
    }
    
    // If not following, return success message
    if (count === 0) {
      console.log(`User ${followerId} is not following user ${followedId}`);
      return res.status(200).json({ message: "Not following this user" });
    }
    
    console.log(`Deleting relationship: ${followerId} unfollowing ${followedId}`);
    
    // Use a transaction to ensure all operations succeed or fail together
    await db.transaction(async (tx) => {
      // Delete relationship
      await tx.execute(
        sql`DELETE FROM user_relationships 
            WHERE follower_id = ${followerId} 
            AND followed_id = ${followedId}`
      );
      
      // Update follower count for followed user
      await tx.execute(
        sql`UPDATE social_profiles 
            SET follower_count = GREATEST(follower_count - 1, 0)
            WHERE user_id = ${followedId}`
      );
      
      // Update following count for follower
      await tx.execute(
        sql`UPDATE social_profiles 
            SET following_count = GREATEST(following_count - 1, 0)
            WHERE user_id = ${followerId}`
      );
    });
    
    return res.status(200).json({ message: "User unfollowed successfully" });
    
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

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
    
    // Get relationships with user and profile info using direct SQL
    console.log(`Fetching following list for user ${userId}`);
    
    // First get relationship IDs to debug
    const relationshipIds = await db.execute(
      sql`SELECT id, follower_id, followed_id, status 
          FROM user_relationships 
          WHERE follower_id = ${userId}
          ORDER BY created_at DESC`
    );
    
    console.log("DEBUG: Found relationships:", JSON.stringify(relationshipIds));
    
    // Get relationships with user and profile info using direct SQL
    const following = await db.execute(
      sql`SELECT 
            ur.id as "relationshipId", 
            ur.status as "relationshipStatus",
            ur.created_at as "relationshipCreatedAt",
            u.id as "userId",
            u.username,
            COALESCE(u.profile_image, '') as "profileImage",
            COALESCE(sp.display_name, u.username) as "displayName",
            COALESCE(sp.bio, '') as "bio",
            sp.expertise,
            sp.specializations,
            COALESCE(sp.location, '') as "location",
            COALESCE(sp.verification_status, 'unverified') as "verificationStatus",
            sp.experience_years as "experienceYears",
            sp.badges,
            COALESCE(sp.follower_count, 0) as "followerCount",
            COALESCE(sp.following_count, 0) as "followingCount"
          FROM user_relationships ur
          INNER JOIN users u ON ur.followed_id = u.id
          LEFT JOIN social_profiles sp ON u.id = sp.user_id
          WHERE ur.follower_id = ${userId}
          ORDER BY ur.created_at DESC
          LIMIT ${limit} OFFSET ${offset}`
    );
    
    console.log(`DEBUG: Found ${following.length || (following.rows ? following.rows.length : 0)} following users`);
    
    // Format the response consistently
    const formattedResults = [];
    if (following && following.rows && following.rows.length > 0) {
      formattedResults.push(...following.rows);
    } else if (Array.isArray(following) && following.length > 0) {
      formattedResults.push(...following);
    }
    
    console.log("DEBUG: Formatted following:", JSON.stringify(formattedResults));
    
    return res.json(formattedResults);
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
          LIMIT ${limit} OFFSET ${offset}`
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
      sql`SELECT followed_id FROM user_relationships WHERE follower_id = ${userId}`
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
    const followedIdsStringForSql = followedUserIds.join(',') || '0';
    
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
          LIMIT ${limit}`
    );
    
    // Format the response consistently
    const formattedResults = [];
    if (suggestedUsers && suggestedUsers.rows && suggestedUsers.rows.length > 0) {
      formattedResults.push(...suggestedUsers.rows);
    } else if (Array.isArray(suggestedUsers) && suggestedUsers.length > 0) {
      formattedResults.push(...suggestedUsers);
    }
    
    console.log(`Found ${formattedResults.length} suggested users after filtering`);
    
    // Return the formatted results from our direct approach
    console.log(`DEBUG: Found ${formattedResults.length} users to suggest after filtering`);
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
      sql`SELECT followed_id FROM user_relationships WHERE follower_id = ${userId}`
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
    
    const followedIdsString = followedIds.join(',');
    
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
      LIMIT ${limit}`
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
      { id: 1, name: "Crop Specialists", icon: "crop", color: "green-600", count: 64 },
      { id: 2, name: "Organic Farming", icon: "sprout", color: "green-600", count: 38 },
      { id: 3, name: "Climate Smart", icon: "cloud", color: "blue-500", count: 27 },
      { id: 4, name: "Agro Dealers", icon: "shopping-bag", color: "orange-500", count: 41 }
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
greenSocialsRouter.post("/posts/:postId/like", isAuthenticated, async (req, res) => {
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
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ))
      .limit(1);
      
    if (existingLike.length) {
      return res.status(400).json({ message: "You already liked this post" });
    }
    
    // Create the like
    await db
      .insert(postLikes)
      .values({
        postId,
        userId
      });
      
    // Increment the post's like count
    await db
      .update(posts)
      .set({
        likeCount: sql`${posts.likeCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
      
    // Create a notification for the post owner
    const postOwner = await db
      .select({ userId: posts.userId, content: posts.content })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
      
    if (postOwner.length && postOwner[0].userId !== userId) {
      const shortContent = postOwner[0].content.length > 50 
        ? postOwner[0].content.substring(0, 50) + '...' 
        : postOwner[0].content;
        
      await db
        .insert(socialNotifications)
        .values({
          userId: postOwner[0].userId,
          type: 'like',
          content: `liked your post: "${shortContent}"`,
          relatedUserId: userId,
          relatedPostId: postId
        });
    }
    
    return res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/social/posts/:postId/like
// Unlike a post
greenSocialsRouter.delete("/posts/:postId/like", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);
    
    // Check if the like exists
    const existingLike = await db
      .select({ id: postLikes.id })
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ))
      .limit(1);
      
    if (!existingLike.length) {
      return res.status(404).json({ message: "Like not found" });
    }
    
    // Delete the like
    await db
      .delete(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));
      
    // Decrement the post's like count
    await db
      .update(posts)
      .set({
        likeCount: sql`GREATEST(${posts.likeCount} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
      
    return res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/comments/:commentId/like
// Like a comment
greenSocialsRouter.post("/comments/:commentId/like", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = parseInt(req.params.commentId);
    
    // Check if the comment exists
    const commentExists = await db
      .select({ id: comments.id, userId: comments.userId, postId: comments.postId })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);
      
    if (!commentExists.length) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if the user already liked the comment
    const existingLike = await db
      .select({ id: commentLikes.id })
      .from(commentLikes)
      .where(and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      ))
      .limit(1);
      
    if (existingLike.length) {
      return res.status(400).json({ message: "You already liked this comment" });
    }
    
    // Create the like
    await db
      .insert(commentLikes)
      .values({
        commentId,
        userId
      });
      
    // Increment the comment's like count
    await db
      .update(comments)
      .set({
        likeCount: sql`${comments.likeCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(comments.id, commentId));
      
    // Create a notification for the comment owner
    if (commentExists[0].userId !== userId) {
      const commentDetails = await db
        .select({ content: comments.content })
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);
        
      if (commentDetails.length) {
        const shortContent = commentDetails[0].content.length > 50 
          ? commentDetails[0].content.substring(0, 50) + '...' 
          : commentDetails[0].content;
          
        await db
          .insert(socialNotifications)
          .values({
            userId: commentExists[0].userId,
            type: 'comment_like',
            content: `liked your comment: "${shortContent}"`,
            relatedUserId: userId,
            relatedCommentId: commentId,
            relatedPostId: commentExists[0].postId
          });
      }
    }
    
    return res.status(200).json({ message: "Comment liked successfully" });
  } catch (error) {
    console.error("Error liking comment:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/social/comments/:commentId/like
// Unlike a comment
greenSocialsRouter.delete("/comments/:commentId/like", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = parseInt(req.params.commentId);
    
    // Check if the like exists
    const existingLike = await db
      .select({ id: commentLikes.id })
      .from(commentLikes)
      .where(and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      ))
      .limit(1);
      
    if (!existingLike.length) {
      return res.status(404).json({ message: "Like not found" });
    }
    
    // Delete the like
    await db
      .delete(commentLikes)
      .where(and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      ));
      
    // Decrement the comment's like count
    await db
      .update(comments)
      .set({
        likeCount: sql`GREATEST(${comments.likeCount} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(comments.id, commentId));
      
    return res.status(200).json({ message: "Comment unliked successfully" });
  } catch (error) {
    console.error("Error unliking comment:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/posts/:postId/share
// Share a post
greenSocialsRouter.post("/posts/:postId/share", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);
    const { targetType, targetId, externalPlatform } = req.body;
    
    // Check if the post exists
    const postExists = await db
      .select({ id: posts.id, userId: posts.userId, content: posts.content })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
      
    if (!postExists.length) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Create the share
    const newShare = await db
      .insert(postShares)
      .values({
        postId,
        userId,
        targetType,
        targetId: targetId || undefined,
        externalPlatform: externalPlatform || undefined
      })
      .returning();
      
    // Increment the post's share count
    await db
      .update(posts)
      .set({
        shareCount: sql`${posts.shareCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
      
    // Create a notification for the post owner
    if (postExists[0].userId !== userId) {
      const shortContent = postExists[0].content.length > 50 
        ? postExists[0].content.substring(0, 50) + '...' 
        : postExists[0].content;
        
      let shareType = 'their profile';
      if (targetType === 'community') {
        shareType = 'a community';
      } else if (targetType === 'external') {
        shareType = externalPlatform || 'an external platform';
      }
      
      await db
        .insert(socialNotifications)
        .values({
          userId: postExists[0].userId,
          type: 'share',
          content: `shared your post to ${shareType}: "${shortContent}"`,
          relatedUserId: userId,
          relatedPostId: postId
        });
    }
    
    return res.status(201).json(newShare[0]);
  } catch (error) {
    console.error("Error sharing post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/posts/:postId/report
// Report a post
greenSocialsRouter.post("/posts/:postId/report", isAuthenticated, async (req, res) => {
  try {
    const reporterId = req.user.id;
    const postId = parseInt(req.params.postId);
    const { reason, description } = req.body;
    
    // Check if the post exists
    const postExists = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
      
    if (!postExists.length) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the user already reported this post
    const existingReport = await db
      .select({ id: contentReports.id })
      .from(contentReports)
      .where(and(
        eq(contentReports.reporterId, reporterId),
        eq(contentReports.targetType, 'post'),
        eq(contentReports.targetId, postId)
      ))
      .limit(1);
      
    if (existingReport.length) {
      return res.status(400).json({ message: "You already reported this post" });
    }
    
    // Create the report
    const newReport = await db
      .insert(contentReports)
      .values({
        reporterId,
        targetType: 'post',
        targetId: postId,
        reason,
        description
      })
      .returning();
      
    return res.status(201).json({ message: "Report submitted successfully", id: newReport[0].id });
  } catch (error) {
    console.error("Error reporting post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/comments/:commentId/report
// Report a comment
greenSocialsRouter.post("/comments/:commentId/report", isAuthenticated, async (req, res) => {
  try {
    const reporterId = req.user.id;
    const commentId = parseInt(req.params.commentId);
    const { reason, description } = req.body;
    
    // Check if the comment exists
    const commentExists = await db
      .select({ id: comments.id })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);
      
    if (!commentExists.length) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if the user already reported this comment
    const existingReport = await db
      .select({ id: contentReports.id })
      .from(contentReports)
      .where(and(
        eq(contentReports.reporterId, reporterId),
        eq(contentReports.targetType, 'comment'),
        eq(contentReports.targetId, commentId)
      ))
      .limit(1);
      
    if (existingReport.length) {
      return res.status(400).json({ message: "You already reported this comment" });
    }
    
    // Create the report
    const newReport = await db
      .insert(contentReports)
      .values({
        reporterId,
        targetType: 'comment',
        targetId: commentId,
        reason,
        description
      })
      .returning();
      
    return res.status(201).json({ message: "Report submitted successfully", id: newReport[0].id });
  } catch (error) {
    console.error("Error reporting comment:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/social/posts/:postId/save
// Save a post (bookmark)
greenSocialsRouter.post("/posts/:postId/save", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);
    const { collectionName } = req.body;
    
    // Check if the post exists
    const postExists = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
      
    if (!postExists.length) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the user already saved this post
    const existingSave = await db
      .select({ id: savedPosts.id })
      .from(savedPosts)
      .where(and(
        eq(savedPosts.userId, userId),
        eq(savedPosts.postId, postId)
      ))
      .limit(1);
      
    if (existingSave.length) {
      return res.status(400).json({ message: "You already saved this post" });
    }
    
    // Create the save
    const newSave = await db
      .insert(savedPosts)
      .values({
        userId,
        postId,
        collectionName: collectionName || 'Saved'
      })
      .returning();
      
    // Update the post's updated timestamp
    // Note: saveCount field doesn't exist in the database table
    await db
      .update(posts)
      .set({
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
      
    return res.status(201).json(newSave[0]);
  } catch (error) {
    console.error("Error saving post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/social/posts/:postId/save
// Unsave a post (remove bookmark)
greenSocialsRouter.delete("/posts/:postId/save", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);
    
    // Check if the save exists
    const existingSave = await db
      .select({ id: savedPosts.id })
      .from(savedPosts)
      .where(and(
        eq(savedPosts.userId, userId),
        eq(savedPosts.postId, postId)
      ))
      .limit(1);
      
    if (!existingSave.length) {
      return res.status(404).json({ message: "Saved post not found" });
    }
    
    // Delete the save
    await db
      .delete(savedPosts)
      .where(eq(savedPosts.id, existingSave[0].id));
      
    // Update the post's updated timestamp
    // Note: saveCount field doesn't exist in the database table
    await db
      .update(posts)
      .set({
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
      
    return res.status(200).json({ message: "Post unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});