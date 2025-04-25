import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Loader2, 
  MessageCircle, 
  Heart, 
  Share2, 
  Bookmark, 
  Send, 
  Home, 
  Newspaper, 
  Users, 
  UserPlus,
  Compass, 
  Lightbulb,
  Image,
  Tag,
  ArrowRight,
  Cloud,
  AlertTriangle,
  Sprout,
  Plus,
  ShoppingBag,
  MapPin,
  UserCheck,
  Award,
  Star,
  Crop
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
    queryKey: ["/profile", user?.id],
    queryFn: () => apiRequest("GET", `/profile/${user?.id}`).then(res => res.json()),
    enabled: !!user,
  });

  // Query for fetching social feed
  const { data: feed, isLoading: isFeedLoading } = useQuery({
    queryKey: ["/feed"],
    queryFn: () => apiRequest("GET", "/feed").then(res => res.json()),
    enabled: !!user,
  });
  
  // Query for fetching people the user follows
  const followingQuery = useQuery({
    queryKey: ["/api/social/following"],
    queryFn: () => apiRequest("GET", "/api/social/following").then(res => res.json()),
    enabled: !!user,
  });
  
  // Query for fetching suggested people to follow
  const suggestedQuery = useQuery({
    queryKey: ["/api/social/suggested"],
    queryFn: () => apiRequest("GET", "/api/social/suggested").then(res => res.json()),
    enabled: !!user,
  });
  
  // Query for fetching recent activity
  const activityQuery = useQuery({
    queryKey: ["/api/social/activity"],
    queryFn: () => apiRequest("GET", "/api/social/activity").then(res => res.json()),
    enabled: !!user,
  });
  
  // Query for fetching expertise categories
  const categoriesQuery = useQuery({
    queryKey: ["/api/social/expertise-categories"],
    queryFn: () => apiRequest("GET", "/api/social/expertise-categories").then(res => res.json()),
    enabled: !!user,
  });

  // State for post creation and interactions
  const [postType, setPostType] = useState("text");
  const [postVisibility, setPostVisibility] = useState("public");
  const [mediaUrls, setMediaUrls] = useState<{url: string, type: string, caption?: string}[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [cropsTagsInput, setCropsTagsInput] = useState("");
  const [cropsTags, setCropsTags] = useState<string[]>([]);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [selectedComment, setSelectedComment] = useState<{id: number, content: string} | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  
  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/posts", {
        content,
        postType,
        visibility: postVisibility,
        media: mediaUrls.length > 0 ? mediaUrls : undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        cropsTags: cropsTags.length > 0 ? cropsTags : undefined
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully!",
      });
      setNewPostContent("");
      setMediaUrls([]);
      setHashtags([]);
      setCropsTags([]);
      setPostType("text");
      setPostVisibility("public");
      setShowPostOptions(false);
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "There was an error creating your post",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for following a user
  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/social/follow/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You are now following this user",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/social/following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/suggested"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/activity"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to follow user",
        description: error.message || "There was an error following this user",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for unfollowing a user
  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/social/follow/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You have unfollowed this user",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/social/following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/suggested"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/activity"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unfollow user",
        description: error.message || "There was an error unfollowing this user",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for liking a post
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/social/posts/${postId}/like`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post liked",
        description: "You liked this post",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to like post",
        description: error.message || "There was an error liking this post",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for unliking a post
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/social/posts/${postId}/like`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post unliked",
        description: "You unliked this post",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unlike post",
        description: error.message || "There was an error unliking this post",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for creating a comment
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: number, content: string, parentId?: number }) => {
      const res = await apiRequest("POST", `/api/social/comments`, {
        postId,
        content,
        parentId
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
      
      // Reset selected comment and reply content
      setSelectedComment(null);
      setReplyContent("");
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add comment",
        description: error.message || "There was an error adding your comment",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for liking a comment
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("POST", `/api/social/comments/${commentId}/like`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment liked",
        description: "You liked this comment",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to like comment",
        description: error.message || "There was an error liking this comment",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for unliking a comment
  const unlikeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/social/comments/${commentId}/like`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment unliked",
        description: "You unliked this comment",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unlike comment",
        description: error.message || "There was an error unliking this comment",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for sharing a post
  const sharePostMutation = useMutation({
    mutationFn: async ({ postId, targetType, targetId, externalPlatform }: { 
      postId: number, 
      targetType: string, 
      targetId?: number, 
      externalPlatform?: string 
    }) => {
      const res = await apiRequest("POST", `/api/social/posts/${postId}/share`, {
        targetType,
        targetId,
        externalPlatform
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post shared",
        description: "The post has been shared successfully",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to share post",
        description: error.message || "There was an error sharing this post",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for saving a post
  const savePostMutation = useMutation({
    mutationFn: async ({ postId, collectionName }: { postId: number, collectionName?: string }) => {
      const res = await apiRequest("POST", `/api/social/posts/${postId}/save`, {
        collectionName
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post saved",
        description: "The post has been saved to your collection",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save post",
        description: error.message || "There was an error saving this post",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for unsaving a post
  const unsavePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/social/posts/${postId}/save`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post removed",
        description: "The post has been removed from your saved collection",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove post",
        description: error.message || "There was an error removing this post from your collection",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for reporting a post
  const reportPostMutation = useMutation({
    mutationFn: async ({ postId, reason, description }: { postId: number, reason: string, description?: string }) => {
      const res = await apiRequest("POST", `/api/social/posts/${postId}/report`, {
        reason,
        description
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. Your report has been submitted.",
      });
      
      // Reset report form
      setReportReason("");
      setReportDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit report",
        description: error.message || "There was an error submitting your report",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for reporting a comment
  const reportCommentMutation = useMutation({
    mutationFn: async ({ commentId, reason, description }: { commentId: number, reason: string, description?: string }) => {
      const res = await apiRequest("POST", `/api/social/comments/${commentId}/report`, {
        reason,
        description
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. Your report has been submitted.",
      });
      
      // Reset report form
      setReportReason("");
      setReportDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit report",
        description: error.message || "There was an error submitting your report",
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
  
  // Handler for toggling post like
  const handleToggleLike = (postId: number, isLiked: boolean) => {
    if (isLiked) {
      unlikePostMutation.mutate(postId);
    } else {
      likePostMutation.mutate(postId);
    }
  };
  
  // Handler for creating a comment on a post
  const handleAddComment = (postId: number, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something in your comment",
        variant: "destructive",
      });
      return;
    }
    
    createCommentMutation.mutate({ postId, content });
  };
  
  // Handler for replying to a comment
  const handleReplyToComment = (commentId: number, postId: number, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Empty reply",
        description: "Please write something in your reply",
        variant: "destructive",
      });
      return;
    }
    
    createCommentMutation.mutate({ 
      postId, 
      content, 
      parentId: commentId 
    });
  };
  
  // Handler for toggling comment like
  const handleToggleCommentLike = (commentId: number, isLiked: boolean) => {
    if (isLiked) {
      unlikeCommentMutation.mutate(commentId);
    } else {
      likeCommentMutation.mutate(commentId);
    }
  };
  
  // Handler for sharing a post
  const handleSharePost = (postId: number, targetType: string, targetId?: number, externalPlatform?: string) => {
    sharePostMutation.mutate({ 
      postId, 
      targetType, 
      targetId, 
      externalPlatform 
    });
  };
  
  // Handler for saving a post
  const handleSavePost = (postId: number, collectionName?: string) => {
    savePostMutation.mutate({ postId, collectionName });
  };
  
  // Handler for unsaving a post
  const handleUnsavePost = (postId: number) => {
    unsavePostMutation.mutate(postId);
  };
  
  // Handler for reporting a post
  const handleReportPost = (postId: number, reason: string, description?: string) => {
    if (!reason) {
      toast({
        title: "Missing reason",
        description: "Please select a reason for your report",
        variant: "destructive",
      });
      return;
    }
    
    reportPostMutation.mutate({ postId, reason, description });
  };
  
  // Handler for reporting a comment
  const handleReportComment = (commentId: number, reason: string, description?: string) => {
    if (!reason) {
      toast({
        title: "Missing reason",
        description: "Please select a reason for your report",
        variant: "destructive",
      });
      return;
    }
    
    reportCommentMutation.mutate({ commentId, reason, description });
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
  
  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(date.toISOString());
  };

  if (isProfileLoading) {
    return (
      <DashboardLayout title="Green Socials">
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Green Socials">
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Green Socials</h1>
        
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="mb-6 flex w-full grid grid-cols-5">
            <TabsTrigger value="feed" className="flex items-center justify-center gap-1.5">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline-block">Feed</span>
              <span className="sr-only sm:hidden">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center justify-center gap-1.5">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline-block">News</span>
              <span className="sr-only sm:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center justify-center gap-1.5">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline-block">Communities</span>
              <span className="sr-only sm:hidden">Communities</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center justify-center gap-1.5">
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline-block">Discover</span>
              <span className="sr-only sm:hidden">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center justify-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline-block">People</span>
              <span className="sr-only sm:hidden">People</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Stories Section */}
                <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 rounded-full p-1.5">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-medium">Stories</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5">
                        <span>View All</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <div className="flex overflow-x-auto pb-2 gap-4 scrollbar-hide">
                      {/* Add Story */}
                      <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                        <div className="relative w-16 h-16 rounded-full border-2 border-muted flex items-center justify-center bg-background cursor-pointer hover:bg-primary/10 transition-colors group">
                          <div className="bg-primary/10 rounded-full p-1.5 group-hover:bg-primary/20 transition-colors">
                            <Plus className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Add Story</span>
                      </div>
                      
                      {/* User Stories */}
                      <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                        <div className="relative w-16 h-16 cursor-pointer">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary-foreground animate-pulse"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-background m-0.5">
                            <Avatar className="w-full h-full border-2 border-background">
                              <AvatarImage src="https://ui.shadcn.com/avatars/01.png" />
                              <AvatarFallback>MK</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <span className="text-xs">Maria K.</span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                        <div className="relative w-16 h-16 cursor-pointer">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-green-500 animate-pulse"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-background m-0.5">
                            <Avatar className="w-full h-full border-2 border-background">
                              <AvatarImage src="https://ui.shadcn.com/avatars/02.png" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <span className="text-xs">James D.</span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                        <div className="relative w-16 h-16 cursor-pointer">
                          <div className="absolute inset-0 rounded-full bg-muted"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-background m-0.5">
                            <Avatar className="w-full h-full border-2 border-background">
                              <AvatarImage src="https://ui.shadcn.com/avatars/03.png" />
                              <AvatarFallback>SC</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <span className="text-xs">Sarah C.</span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                        <div className="relative w-16 h-16 cursor-pointer">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-blue-500 animate-pulse"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-background m-0.5">
                            <Avatar className="w-full h-full border-2 border-background">
                              <AvatarImage src="https://ui.shadcn.com/avatars/04.png" />
                              <AvatarFallback>TM</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <span className="text-xs">Thabo M.</span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                        <div className="relative w-16 h-16 cursor-pointer">
                          <div className="absolute inset-0 rounded-full bg-muted"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-background m-0.5">
                            <Avatar className="w-full h-full border-2 border-background">
                              <AvatarImage src="https://ui.shadcn.com/avatars/05.png" />
                              <AvatarFallback>EJ</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <span className="text-xs">Esther J.</span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
                        <div className="relative w-16 h-16 cursor-pointer">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-orange-500 animate-pulse"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-background m-0.5">
                            <Avatar className="w-full h-full border-2 border-background">
                              <AvatarImage src="https://ui.shadcn.com/avatars/06.png" />
                              <AvatarFallback>KN</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <span className="text-xs">Kwame N.</span>
                      </div>
                    </div>
                  </div>
                </div>
                
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
                      <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                        <Image className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Photo</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                        <Tag className="h-4 w-4" />
                        <span className="hidden sm:inline-block">Tag Crops</span>
                      </Button>
                    </div>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending}
                      className="flex items-center gap-1.5"
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                          <span className="hidden sm:inline-block">Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline-block">Post</span>
                        </>
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
                    // Create a combined array with posts and sponsored content for mobile view
                    <>
                      {/* Merged Feed for Mobile */}
                      <div className="lg:hidden space-y-6">
                        {[...feed]
                          // Insert sponsored ads at positions 2 and 5
                          .reduce((result: (Post | { isSponsoredAd: boolean; adId: number; adContent: React.ReactNode })[], post, idx) => {
                            result.push(post);
                            
                            // After second post, add first sponsored ad
                            if (idx === 1) {
                              result.push({
                                isSponsoredAd: true,
                                adId: 1,
                                adContent: (
                                  <Card className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 rounded-full p-2">
                                          <Bookmark className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                          <CardTitle className="text-base flex items-center">
                                            Sponsored
                                            <Badge variant="outline" className="ml-2 text-xs">Premium Seed</Badge>
                                          </CardTitle>
                                          <CardDescription>Climate-Resilient Maize Seeds</CardDescription>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="aspect-video bg-muted rounded-md mb-3 relative">
                                        <div className="absolute inset-0 flex items-end p-3">
                                          <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">Product</span>
                                        </div>
                                      </div>
                                      <p className="text-sm">Early-maturing, drought-resistant variety perfect for uncertain climate conditions.</p>
                                      <div className="mt-2 flex justify-between items-center">
                                        <span className="font-bold">ZMW 850</span>
                                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs flex items-center gap-1">
                                          <span>View Listing</span>
                                          <ArrowRight className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              });
                            }
                            
                            // After fifth post, add second sponsored ad
                            if (idx === 4 && feed.length > 4) {
                              result.push({
                                isSponsoredAd: true,
                                adId: 2,
                                adContent: (
                                  <Card className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-start gap-4">
                                        <div className="bg-orange-500/10 rounded-full p-2">
                                          <ShoppingBag className="h-4 w-4 text-orange-500" />
                                        </div>
                                        <div>
                                          <CardTitle className="text-base flex items-center">
                                            Sponsored
                                            <Badge variant="outline" className="ml-2 text-xs bg-orange-500/10">Equipment</Badge>
                                          </CardTitle>
                                          <CardDescription>Portable Soil Testing Kit</CardDescription>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="aspect-video bg-muted rounded-md mb-3 relative">
                                        <div className="absolute inset-0 flex items-end p-3">
                                          <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">Equipment</span>
                                        </div>
                                      </div>
                                      <p className="text-sm">Analyze soil nutrients in minutes with this portable testing kit.</p>
                                      <div className="mt-2 flex justify-between items-center">
                                        <span className="font-bold">ZMW 1,200</span>
                                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs flex items-center gap-1">
                                          <span>View Listing</span>
                                          <ArrowRight className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              });
                            }
                            
                            return result;
                          }, [])
                          .map((item, idx) => {
                            if ('isSponsoredAd' in item) {
                              return <div key={`ad-${item.adId}`}>{item.adContent}</div>;
                            }
                            
                            const post = item as Post;
                            return (
                              <Card key={`post-${post.post.id}`} className="overflow-hidden">
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
                                      <span className="text-xs">{post.post.likeCount}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="gap-1">
                                      <MessageCircle className="h-4 w-4" />
                                      <span className="text-xs">{post.post.commentCount}</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="aspect-square p-0 sm:aspect-auto sm:px-3">
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="aspect-square p-0 sm:aspect-auto sm:px-3">
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
                            );
                          })
                        }
                      </div>
                      
                      {/* Regular Feed for Desktop */}
                      <div className="hidden lg:block space-y-6">
                        {feed.map((post: Post) => (
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
                                  <span className="text-xs">{post.post.likeCount}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="text-xs">{post.post.commentCount}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="aspect-square p-0 sm:aspect-auto sm:px-3">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="aspect-square p-0 sm:aspect-auto sm:px-3">
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
                        ))}
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">No posts to display yet</p>
                        <p className="text-sm text-center max-w-md mb-6">
                          Follow other users or join communities to see their posts in your feed, or be the first to create a post!
                        </p>
                        <Button variant="outline" className="flex items-center gap-1.5">
                          <Compass className="h-4 w-4" />
                          <span className="hidden sm:inline-block">Discover Users and Communities</span>
                          <span className="sm:hidden">Discover</span>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Right Sidebar - Sponsored Content */}
              <div className="space-y-6">
                {/* Sponsored Marketplace Listings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="bg-primary/10 rounded-full p-1.5">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </span>
                      Marketplace Highlights
                    </CardTitle>
                    <CardDescription className="text-xs">Products from verified agricultural suppliers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50 cursor-pointer group">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <div className="absolute top-0 right-0 m-2">
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs font-medium">
                            2.4km away
                          </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 p-2">
                          <Badge className="bg-primary text-xs">Premium Seed</Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">Climate-Resilient Maize Seeds</h4>
                        <div className="flex items-center gap-1 mb-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Lusaka Central Market</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Early-maturing, drought-resistant variety</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">ZMW 850</span>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex items-center gap-1 group-hover:text-primary transition-colors">
                            <span>View</span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50 cursor-pointer group">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <div className="absolute top-0 right-0 m-2">
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs font-medium">
                            5.1km away
                          </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 p-2">
                          <Badge className="bg-orange-500 text-xs">Equipment</Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">Portable Soil Testing Kit</h4>
                        <div className="flex items-center gap-1 mb-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">AgriTech Center, Lusaka</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Analyze soil nutrients in minutes</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">ZMW 1,200</span>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex items-center gap-1 group-hover:text-primary transition-colors">
                            <span>View</span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/50 cursor-pointer group">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <div className="absolute top-0 right-0 m-2">
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs font-medium">
                            3.7km away
                          </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 p-2">
                          <Badge className="bg-green-600 text-xs">Organic</Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">Organic Fertilizer Blend</h4>
                        <div className="flex items-center gap-1 mb-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Green Earth Farm, Chongwe</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Natural nutrients for improved soil health</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">ZMW 450</span>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex items-center gap-1 group-hover:text-primary transition-colors">
                            <span>View</span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1.5 hover:bg-primary/5 transition-colors">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="hidden sm:inline-block">Browse Marketplace</span>
                      <span className="sm:hidden">Browse</span>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Weather Alerts */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="bg-blue-500/10 rounded-full p-1.5">
                        <Cloud className="h-4 w-4 text-blue-500" />
                      </span>
                      Weather Alerts
                    </CardTitle>
                    <CardDescription className="text-xs">Recent weather conditions that may affect your area</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500 hover:bg-yellow-500/15 transition-colors cursor-pointer">
                      <div className="shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Heavy Rainfall Expected</h4>
                        <p className="text-xs text-muted-foreground">Lusaka Region • Next 48 Hours</p>
                        <p className="text-xs text-yellow-600 mt-1">Secure your crops and ensure proper drainage</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="shrink-0 text-green-500">
                        <Sprout className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Favorable Planting Conditions</h4>
                        <p className="text-xs text-muted-foreground">Northern Region • Next Week</p>
                        <p className="text-xs text-green-600 mt-1">Optimal soil moisture levels for seed germination</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1.5 hover:bg-blue-500/5 transition-colors">
                      <Cloud className="h-4 w-4" />
                      <span className="hidden sm:inline-block">See Full Forecast</span>
                      <span className="sm:hidden">Forecast</span>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agricultural News & Updates</CardTitle>
                <CardDescription>The latest agricultural news and updates from trusted sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 bg-muted">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <Badge className="bg-primary mb-2">Featured</Badge>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground mb-2">April 23, 2025</p>
                      <h3 className="font-bold mb-2 text-base line-clamp-2">New Climate-Resilient Seed Varieties Released for Zambian Farmers</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        The Ministry of Agriculture has announced the release of new drought-resistant maize and sorghum varieties, 
                        developed to help smallholder farmers adapt to changing climate conditions.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="link" className="p-0 h-auto text-primary flex items-center gap-1.5">
                        <span>Read More</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 bg-muted">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <Badge className="bg-orange-500 mb-2">Market Trends</Badge>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground mb-2">April 22, 2025</p>
                      <h3 className="font-bold mb-2 text-base line-clamp-2">Agricultural Commodity Prices Show Strong Recovery in Q2</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        Commodity markets for major export crops have shown significant improvement, with prices 
                        increasing by 15% on average compared to the previous quarter.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="link" className="p-0 h-auto text-primary flex items-center gap-1.5">
                        <span>Read More</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 bg-muted">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <Badge className="bg-green-600 mb-2">Sustainability</Badge>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground mb-2">April 20, 2025</p>
                      <h3 className="font-bold mb-2 text-base line-clamp-2">Regenerative Farming Practices Gain Traction Among Commercial Farmers</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        More farmers are adopting regenerative agriculture methods, reporting improved soil health, 
                        better water retention, and increased biodiversity on their farms.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="link" className="p-0 h-auto text-primary flex items-center gap-1.5">
                        <span>Read More</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Recent Updates</h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start p-4 rounded-lg border hover:bg-muted/50 transition-colors duration-200">
                      <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0"></div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">April 19, 2025</p>
                        <h4 className="font-medium mb-1">New Organic Certification Standards Introduced</h4>
                        <p className="text-sm text-muted-foreground">Updated organic certification requirements will go into effect next month, focusing on soil health and biodiversity.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start p-4 rounded-lg border hover:bg-muted/50 transition-colors duration-200">
                      <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0"></div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">April 18, 2025</p>
                        <h4 className="font-medium mb-1">Agricultural Technology Expo Announced for July</h4>
                        <p className="text-sm text-muted-foreground">The annual AgTech Expo will showcase the latest innovations in farming technology, precision agriculture, and IoT solutions.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start p-4 rounded-lg border hover:bg-muted/50 transition-colors duration-200">
                      <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0"></div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">April 16, 2025</p>
                        <h4 className="font-medium mb-1">Government Extends Subsidies for Small-Scale Farmers</h4>
                        <p className="text-sm text-muted-foreground">The Ministry of Agriculture has extended its subsidy program for smallholder farmers for another year, covering seeds, fertilizers, and equipment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t pt-6">
                <Button variant="outline" className="flex items-center gap-1.5">
                  <Newspaper className="h-4 w-4" />
                  <span className="hidden sm:inline-block">View All News</span>
                  <span className="sm:hidden">View All</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
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
          
          <TabsContent value="people">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* People You Follow Section */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 rounded-full p-1.5">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">People You Follow</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        See All
                      </Button>
                    </div>
                    <CardDescription>Connect with farming experts and friends in your network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Following List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {followingQuery.isLoading ? (
                        <div className="col-span-full flex justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : followingQuery.data && followingQuery.data.length > 0 ? (
                        followingQuery.data.slice(0, 4).map((item: any) => (
                          <div 
                            key={item.relationshipId} 
                            className="flex flex-col items-center border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                          >
                            <div className="relative mb-2">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={item.profileImage || undefined} />
                                <AvatarFallback>{getInitials(item.displayName || item.username)}</AvatarFallback>
                              </Avatar>
                              {item.verificationStatus === 'verified' && (
                                <div className="absolute -top-1 -right-1 bg-primary/10 rounded-full p-1">
                                  <Award className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              {item.expertise?.some((exp: string) => exp.toLowerCase().includes('crop')) && (
                                <div className="absolute -top-1 -right-1 bg-green-500/10 rounded-full p-1">
                                  <Crop className="h-4 w-4 text-green-500" />
                                </div>
                              )}
                            </div>
                            <h4 className="font-medium">{item.displayName || item.username}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {item.expertise?.[0] || 'Farmer'} • {item.location || 'Zambia'}
                            </p>
                            <div className="flex gap-1 mb-3 flex-wrap justify-center">
                              {item.specializations?.slice(0, 2).map((spec: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{spec}</Badge>
                              ))}
                              {(!item.specializations || item.specializations.length === 0) && 
                               item.expertise?.slice(0, 2).map((exp: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                              ))}
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button variant="secondary" size="sm" className="flex-1 text-xs">Message</Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => unfollowMutation.mutate(item.userId)}
                                disabled={unfollowMutation.isPending}
                              >
                                {unfollowMutation.isPending && unfollowMutation.variables === item.userId ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                Unfollow
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-10">
                          <p className="text-muted-foreground">You're not following anyone yet.</p>
                          <p className="text-sm text-muted-foreground mt-1">Check out the suggestions and find people to follow.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Activity Feed */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 rounded-full p-1.5">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <CardDescription>See what people in your network have been up to</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activityQuery.isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : activityQuery.data && activityQuery.data.length > 0 ? (
                      activityQuery.data.map((activity: any) => (
                        <div key={`${activity.type}-${activity.id}`} className="flex gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={activity.profileImage || undefined} />
                            <AvatarFallback>{getInitials(activity.displayName || activity.username)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{activity.displayName || activity.username}</span> 
                              {activity.type === 'post' ? (
                                ' shared a new post'
                              ) : (
                                ' commented on a post'
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(new Date(activity.createdAt))}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">No recent activity</p>
                        <p className="text-sm text-muted-foreground mt-1">Follow more people to see their activity here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Suggested People Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 rounded-full p-1.5">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Suggested People</CardTitle>
                    </div>
                    <CardDescription>Connect with more farmers and experts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestedQuery.isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : suggestedQuery.data && suggestedQuery.data.length > 0 ? (
                      suggestedQuery.data.map((item: any) => (
                        <div key={item.userId} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.profileImage || undefined} />
                              <AvatarFallback>{getInitials(item.displayName || item.username)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium">{item.displayName || item.username}</p>
                                {item.verificationStatus === 'verified' && (
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {Array.isArray(item.expertise) && item.expertise.length > 0 
                                  ? item.expertise[0] 
                                  : 'Farmer'} • {item.location || 'Zambia'}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {Array.isArray(item.specializations) && item.specializations.length > 0 && 
                                  item.specializations.slice(0, 1).map((spec: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">{spec}</Badge>
                                  ))
                                }
                                {(!item.specializations || !Array.isArray(item.specializations) || item.specializations.length === 0) && 
                                  Array.isArray(item.expertise) && item.expertise.length > 0 &&
                                  item.expertise.slice(0, 1).map((exp: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                                  ))
                                }
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="h-8 px-3"
                            onClick={() => followMutation.mutate(item.userId)}
                            disabled={followMutation.isPending}
                          >
                            {followMutation.isPending && followMutation.variables === item.userId ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            Follow
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">No suggestions available</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => suggestedQuery.refetch()}>
                      View More Suggestions
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Farmers By Expertise */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 rounded-full p-1.5">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Expertise Categories</CardTitle>
                    </div>
                    <CardDescription>Find farmers by their areas of expertise</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categoriesQuery.isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : categoriesQuery.data && categoriesQuery.data.length > 0 ? (
                      categoriesQuery.data.map((category: any) => (
                        <div key={category.id} className="flex justify-between p-3 border rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2">
                            {category.icon === 'crop' && <Crop className={`h-4 w-4 text-${category.color}`} />}
                            {category.icon === 'sprout' && <Sprout className={`h-4 w-4 text-${category.color}`} />}
                            {category.icon === 'cloud' && <Cloud className={`h-4 w-4 text-${category.color}`} />}
                            {category.icon === 'shopping-bag' && <ShoppingBag className={`h-4 w-4 text-${category.color}`} />}
                            <span>{category.name}</span>
                          </div>
                          <Badge>{category.count}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">No categories available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GreenSocialsPage;