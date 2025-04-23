import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, MessageCircle, Heart, Share2, Bookmark, Send } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

interface SocialProfile {
  id: number;
  userId: number;
  displayName: string;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  verificationStatus: string;
  expertise: string[];
  experienceYears: number | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

interface Post {
  post: {
    id: number;
    userId: number;
    content: string;
    postType: string;
    visibility: string;
    media: Array<{ url: string; type: string; caption?: string }> | null;
    communityId: number | null;
    hashtags: string[] | null;
    cropsTags: string[] | null;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    publishedAt: string;
  };
  author: {
    id: number;
    username: string;
    profileImage: string | null;
  };
  profile: {
    displayName: string;
  };
}

interface Comment {
  comment: {
    id: number;
    userId: number;
    postId: number;
    content: string;
    parentId: number | null;
    likeCount: number;
    replyCount: number;
    createdAt: string;
  };
  author: {
    id: number;
    username: string;
    profileImage: string | null;
  };
  profile: {
    displayName: string;
  };
}

const GreenSocialsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");

  // Query for fetching user's social profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["/api/social/profile", user?.id],
    queryFn: () => apiRequest("GET", `/api/social/profile/${user?.id}`).then(res => res.json()),
    enabled: !!user,
  });

  // Query for fetching social feed
  const { data: feed, isLoading: isFeedLoading } = useQuery({
    queryKey: ["/api/social/feed"],
    queryFn: () => apiRequest("GET", "/api/social/feed").then(res => res.json()),
    enabled: !!user,
  });

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/social/posts", {
        content,
        postType: "text",
        visibility: "public"
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully!",
      });
      setNewPostContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "There was an error creating your post",
        variant: "destructive",
      });
    }
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something in your post",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate(newPostContent);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isProfileLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Green Socials</h1>
        
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6">
            {/* Create Post Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Create Post</CardTitle>
                <CardDescription>Share your thoughts, tips, or questions with the community</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="What's on your mind?" 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-24"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Photo</Button>
                  <Button variant="outline" size="sm">Tag Crops</Button>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>Post</>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Feed Content */}
            <div className="space-y-6">
              {isFeedLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : feed && feed.length > 0 ? (
                feed.map((post: Post) => (
                  <Card key={post.post.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={post.author.profileImage || undefined} />
                          <AvatarFallback>{getInitials(post.profile.displayName || post.author.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{post.profile.displayName || post.author.username}</CardTitle>
                          <CardDescription>{formatDate(post.post.publishedAt)}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap">{post.post.content}</div>
                      
                      {post.post.media && post.post.media.length > 0 && (
                        <div className="mt-4 rounded-md overflow-hidden">
                          {post.post.media.map((item, idx) => (
                            item.type.includes('image') ? (
                              <img 
                                key={idx}
                                src={item.url} 
                                alt={item.caption || 'Post image'} 
                                className="w-full h-auto object-cover max-h-96"
                              />
                            ) : null
                          ))}
                        </div>
                      )}
                      
                      {post.post.hashtags && post.post.hashtags.length > 0 && (
                        <div className="mt-2">
                          {post.post.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-primary mr-2">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t px-6 py-3">
                      <div className="flex justify-between w-full">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.post.likeCount}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.post.commentCount}</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                    
                    {/* Comment section (collapsed by default) */}
                    <div className="px-6 py-3 bg-muted/20">
                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.profileImage || undefined} />
                          <AvatarFallback>{getInitials(user?.username || "")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex items-center gap-2">
                          <Input placeholder="Write a comment..." className="h-9" />
                          <Button size="icon" className="h-9 w-9">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No posts to display yet</p>
                    <p className="text-sm text-center max-w-md mb-6">
                      Follow other users or join communities to see their posts in your feed, or be the first to create a post!
                    </p>
                    <Button variant="outline">Discover Users and Communities</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="communities">
            <Card>
              <CardContent className="pt-6">
                <p>Community features are coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="discover">
            <Card>
              <CardContent className="pt-6">
                <p>Discover features are coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge">
            <Card>
              <CardContent className="pt-6">
                <p>Knowledge Base features are coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GreenSocialsPage;