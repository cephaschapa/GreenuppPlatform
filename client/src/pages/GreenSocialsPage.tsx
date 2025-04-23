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
  Compass, 
  Lightbulb,
  Image,
  Tag,
  ArrowRight,
  Cloud,
  AlertTriangle,
  Sprout
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

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/posts", {
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
          <TabsList className="mb-6">
            <TabsTrigger value="feed" className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-1.5">
              <Newspaper className="h-4 w-4" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Communities</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-1.5">
              <Compass className="h-4 w-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
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
                        <span>Photo</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                        <Tag className="h-4 w-4" />
                        <span>Tag Crops</span>
                      </Button>
                    </div>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending}
                      className="flex items-center gap-1.5"
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Post</span>
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
                        <Button variant="outline" className="flex items-center gap-1.5">
                          <Compass className="h-4 w-4" />
                          <span>Discover Users and Communities</span>
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
                      <span className="bg-primary/10 rounded-full p-1">
                        <Bookmark className="h-4 w-4 text-primary" />
                      </span>
                      Sponsored Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-muted relative">
                        <div className="absolute bottom-0 left-0 p-2">
                          <Badge className="bg-primary text-xs">Premium Seed</Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1">Climate-Resilient Maize Seeds</h4>
                        <p className="text-xs text-muted-foreground mb-2">Early-maturing, drought-resistant variety</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">ZMW 850</span>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex items-center gap-1">
                            <span>View</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-muted relative">
                        <div className="absolute bottom-0 left-0 p-2">
                          <Badge className="bg-orange-500 text-xs">Equipment</Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1">Portable Soil Testing Kit</h4>
                        <p className="text-xs text-muted-foreground mb-2">Analyze soil nutrients in minutes</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">ZMW 1,200</span>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex items-center gap-1">
                            <span>View</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1.5">
                      <Compass className="h-4 w-4" />
                      <span>Browse Marketplace</span>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Weather Alerts */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="bg-blue-500/10 rounded-full p-1">
                        <Cloud className="h-4 w-4 text-blue-500" />
                      </span>
                      Weather Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">
                      <div className="shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Heavy Rainfall Expected</h4>
                        <p className="text-xs text-muted-foreground">Lusaka Region • Next 48 Hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="shrink-0 text-green-500">
                        <Sprout className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Favorable Planting Conditions</h4>
                        <p className="text-xs text-muted-foreground">Northern Region • Next Week</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1.5">
                      <Cloud className="h-4 w-4" />
                      <span>See Full Forecast</span>
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
                      <Button variant="link" className="p-0 h-auto text-primary">Read More</Button>
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
                      <Button variant="link" className="p-0 h-auto text-primary">Read More</Button>
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
                      <Button variant="link" className="p-0 h-auto text-primary">Read More</Button>
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
                  <span>View All News</span>
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