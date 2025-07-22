import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  ShoppingCart,
  MessageSquare,
  Activity,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AdminDashboardData {
  overview: {
    totalUsers: number;
    newUsersThisWeek: number;
    totalListings: number;
    activeListings: number;
    totalContacts: number;
    newContactsThisWeek: number;
    totalLoginAttempts: number;
    failedLoginAttempts: number;
  };
  performance: any;
  cache: any;
  system: any;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  phone: string | null;
  fcmToken: string | null;
  fcmTokenUpdatedAt: string | null;
  pushNotificationsEnabled: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } =
    useQuery<AdminDashboardData>({
      queryKey: ["admin-dashboard"],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/dashboard");
        return response.json();
      },
      refetchInterval: 30000, // Refresh every 30 seconds
    });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, userRoleFilter]);

  // Trigger filtering state when search or filter changes
  useEffect(() => {
    setIsFiltering(true);
    setUserPage(1); // Reset to first page when filters change
  }, [userSearch, userRoleFilter]);

  // Fetch users with pagination and filtering
  const { data: userData, isLoading: usersLoading } =
    useQuery<UserListResponse>({
      queryKey: ["admin-users", userPage, userSearch, userRoleFilter],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: userPage.toString(),
          limit: "20",
        });
        if (userSearch) params.append("search", userSearch);
        if (userRoleFilter && userRoleFilter !== "all")
          params.append("role", userRoleFilter);

        const response = await apiRequest("GET", `/api/admin/users?${params}`);
        return response.json();
      },
    });

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/analytics");
      return response.json();
    },
  });

  // Fetch content data
  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/content");
      return response.json();
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    queryClient.invalidateQueries({ queryKey: ["admin-content"] });
    toast({
      title: "Dashboard refreshed",
      description: "All data has been updated",
    });
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement user editing functionality
    toast({
      title: "Edit User",
      description: `Edit functionality for ${user.username} will be implemented soon.`,
    });
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "farmer":
        return "default";
      case "buyer":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (dashboardLoading) {
    return (
      <AdminLayout
        title="Admin Dashboard"
        description="System administration and monitoring"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="System administration and monitoring"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System administration, user management, and performance monitoring
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardData?.overview.totalUsers || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +
                    {formatNumber(
                      dashboardData?.overview.newUsersThisWeek || 0
                    )}{" "}
                    this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Listings
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardData?.overview.activeListings || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of{" "}
                    {formatNumber(dashboardData?.overview.totalListings || 0)}{" "}
                    total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Contact Forms
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardData?.overview.totalContacts || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +
                    {formatNumber(
                      dashboardData?.overview.newContactsThisWeek || 0
                    )}{" "}
                    this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Failed Logins
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(
                      dashboardData?.overview.failedLoginAttempts || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of{" "}
                    {formatNumber(
                      dashboardData?.overview.totalLoginAttempts || 0
                    )}{" "}
                    total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache</span>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">
                      {dashboardData?.system.memory.heapUsed || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">
                      {Math.floor((dashboardData?.system.uptime || 0) / 3600)}h
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Users Today</span>
                    <span className="text-sm font-medium">
                      {formatNumber(
                        dashboardData?.overview.newUsersThisWeek || 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Listings Today</span>
                    <span className="text-sm font-medium">
                      {formatNumber(
                        dashboardData?.overview.activeListings || 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Login Attempts</span>
                    <span className="text-sm font-medium">
                      {formatNumber(
                        dashboardData?.overview.totalLoginAttempts || 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed Logins</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatNumber(
                        dashboardData?.overview.failedLoginAttempts || 0
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* User Filters */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="max-w-sm pr-10"
                    />
                    {isFiltering && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <Select
                    value={userRoleFilter}
                    onValueChange={setUserRoleFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                      {isFiltering && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading || isFiltering
                        ? // Loading skeleton rows
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-48" />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-6 w-16" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Skeleton className="h-8 w-8" />
                                  <Skeleton className="h-8 w-8" />
                                  <Skeleton className="h-8 w-8" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        : userData?.users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {user.firstName && user.lastName
                                      ? `${user.firstName} ${user.lastName}`
                                      : user.username}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(user.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewUser(user)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                    disabled={deleteUserMutation.isPending}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    {deleteUserMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {userData?.pagination && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing{" "}
                      {(userData.pagination.page - 1) *
                        userData.pagination.limit +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        userData.pagination.page * userData.pagination.limit,
                        userData.pagination.totalCount
                      )}{" "}
                      of {userData.pagination.totalCount} users
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!userData.pagination.hasPrev}
                        onClick={() =>
                          setUserPage(userData.pagination.page - 1)
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!userData.pagination.hasNext}
                        onClick={() =>
                          setUserPage(userData.pagination.page + 1)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics charts and trends will be displayed here.</p>
                    <p className="text-sm">
                      User registration trends, login patterns, and marketplace
                      activity.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Recent Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contentLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contentData?.recentListings?.map((listing: any) => (
                        <div
                          key={listing.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{listing.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {listing.category} •{" "}
                              {formatDate(listing.createdAt)}
                            </div>
                          </div>
                          <Badge
                            variant={
                              listing.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {listing.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Contact Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contentLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contentData?.recentContacts?.map((contact: any) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {contact.email} • {formatDate(contact.createdAt)}
                            </div>
                          </div>
                          <Badge
                            variant={
                              contact.status === "pending"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {contact.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Memory Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Heap Used</span>
                        <span className="text-sm font-medium">
                          {dashboardData?.system.memory.heapUsed || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Heap Total</span>
                        <span className="text-sm font-medium">
                          {dashboardData?.system.memory.heapTotal || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">External</span>
                        <span className="text-sm font-medium">
                          {dashboardData?.system.memory.external || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">System Info</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Uptime</span>
                        <span className="text-sm font-medium">
                          {Math.floor(
                            (dashboardData?.system.uptime || 0) / 3600
                          )}{" "}
                          hours
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className="text-sm font-medium">
                          {dashboardData?.system.responseTime || 0}ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Username:</span>{" "}
                      {selectedUser.username}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedUser.email}
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedUser.firstName && selectedUser.lastName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>{" "}
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedUser.phone || "Not provided"}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(selectedUser.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>{" "}
                      {formatDate(selectedUser.updatedAt)}
                    </div>
                    <div>
                      <span className="font-medium">Push Notifications:</span>{" "}
                      {selectedUser.pushNotificationsEnabled
                        ? "Enabled"
                        : "Disabled"}
                    </div>
                    <div>
                      <span className="font-medium">FCM Token:</span>{" "}
                      {selectedUser.fcmToken ? "Present" : "Not set"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Image */}
              {selectedUser.profileImage && (
                <div>
                  <h3 className="font-semibold mb-2">Profile Image</h3>
                  <img
                    src={selectedUser.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleEditUser(selectedUser)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsUserDialogOpen(false);
                    handleDeleteUser(selectedUser);
                  }}
                  disabled={deleteUserMutation.isPending}
                  className="flex-1"
                >
                  {deleteUserMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
