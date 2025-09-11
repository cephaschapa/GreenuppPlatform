import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminAlertCenter } from "@/components/admin/AdminAlertCenter";
import { PestOutbreakDashboard } from "@/components/admin/PestOutbreakDashboard";
import { AdminUserMap } from "@/components/admin/AdminUserMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  // DialogTrigger,
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
  AlertTriangle,
  CheckCircle,
  Megaphone,
  Bug,
  MapPin,
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
  performance: unknown;
  cache: unknown;
  system: unknown;
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
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
  });

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
  const { data: _analyticsData, isLoading: analyticsLoading } = useQuery({
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
    setEditUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const editUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: any }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/users/${userId}`,
        data
      );
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User updated",
        description: "User has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      setEditUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateEditForm = () => {
    const errors: string[] = [];

    if (!editFormData.username.trim()) {
      errors.push("Username is required");
    } else if (editFormData.username.length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    if (!editFormData.email.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.push("Invalid email format");
    }

    if (!editFormData.role) {
      errors.push("Role is required");
    }

    return errors;
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    // Validate form
    const validationErrors = validateEditForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Only send changed fields
    const changes: any = {};
    if (editFormData.username !== editUser.username)
      changes.username = editFormData.username.trim();
    if (editFormData.email !== editUser.email)
      changes.email = editFormData.email.trim();
    if (editFormData.firstName !== (editUser.firstName || ""))
      changes.firstName = editFormData.firstName.trim() || null;
    if (editFormData.lastName !== (editUser.lastName || ""))
      changes.lastName = editFormData.lastName.trim() || null;
    if (editFormData.role !== editUser.role) changes.role = editFormData.role;

    if (Object.keys(changes).length === 0) {
      toast({
        title: "No changes",
        description: "No changes were made to the user.",
      });
      return;
    }

    editUserMutation.mutate({ userId: editUser.id, data: changes });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const cancelEditUser = () => {
    setIsEditDialogOpen(false);
    setEditUser(null);
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
      // Close the delete modal
      setIsDeleteDialogOpen(false);
      setDeleteUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      // Keep modal open on error so user can retry or cancel
    },
  });

  const handleDeleteUser = (user: User) => {
    setDeleteUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (deleteUser) {
      deleteUserMutation.mutate(deleteUser.id);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false);
    setDeleteUser(null);
  };

  // Bulk delete functions
  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === userData?.users.length) {
      setSelectedUsers(new Set());
    } else {
      const allUserIds = new Set(userData?.users.map((user) => user.id) || []);
      setSelectedUsers(allUserIds);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;
    setIsBulkDeleteDialogOpen(true);
  };

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      const results = await Promise.allSettled(
        userIds.map((userId) =>
          apiRequest("DELETE", `/api/admin/users/${userId}`)
        )
      );

      const failures = results
        .map((result, index) => ({ result, userId: userIds[index] }))
        .filter(({ result }) => result.status === "rejected")
        .map(({ userId }) => userId);

      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} user(s)`);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Users deleted",
        description: `Successfully deleted ${selectedUsers.size} user(s).`,
      });
      setSelectedUsers(new Set());
      setIsBulkDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const confirmBulkDelete = () => {
    const userIds = Array.from(selectedUsers);
    bulkDeleteMutation.mutate(userIds);
  };

  const cancelBulkDelete = () => {
    setIsBulkDeleteDialogOpen(false);
  };

  const getSelectedUsersData = () => {
    return userData?.users.filter((user) => selectedUsers.has(user.id)) || [];
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
        <div className="flex items-center justify-end">
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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="user-map">
              <MapPin className="h-4 w-4 mr-2" />
              User Map
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Megaphone className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="pest-outbreaks">
              <Bug className="h-4 w-4 mr-2" />
              Pest Outbreaks
            </TabsTrigger>
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
                <div className="space-y-4">
                  <div className="flex gap-4 mb-4">
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

                  {/* Bulk Actions */}
                  {selectedUsers.size > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {selectedUsers.size} user(s) selected
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUsers(new Set())}
                        >
                          Clear Selection
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                          disabled={bulkDeleteMutation.isPending}
                        >
                          {bulkDeleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete Selected
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedUsers.size === userData?.users.length &&
                              userData?.users.length > 0
                            }
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all users"
                          />
                        </TableHead>
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
                                <Skeleton className="h-4 w-4" />
                              </TableCell>
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
                                <Checkbox
                                  checked={selectedUsers.has(user.id)}
                                  onCheckedChange={() =>
                                    toggleUserSelection(user.id)
                                  }
                                  aria-label={`Select ${user.username}`}
                                />
                              </TableCell>
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

          {/* Alert Center Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <AdminAlertCenter />
          </TabsContent>

          {/* User Map Tab */}
          <TabsContent value="user-map" className="space-y-6">
            <AdminUserMap />
          </TabsContent>

          {/* Pest Outbreak Dashboard Tab */}
          <TabsContent value="pest-outbreaks" className="space-y-6">
            <PestOutbreakDashboard />
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

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user and all associated data.
            </DialogDescription>
          </DialogHeader>
          {deleteUser && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-lg">
                      {deleteUser.firstName?.[0] ||
                        deleteUser.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-red-900 dark:text-red-100">
                      {deleteUser.firstName && deleteUser.lastName
                        ? `${deleteUser.firstName} ${deleteUser.lastName}`
                        : deleteUser.username}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {deleteUser.email}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Role: {deleteUser.role}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">This will delete:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>User account and profile</li>
                  <li>All farming data (fields, crops)</li>
                  <li>Marketplace listings and activity</li>
                  <li>Notifications and settings</li>
                  <li>Authentication and security data</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={cancelDeleteUser}
                  className="flex-1"
                  disabled={deleteUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteUser}
                  className="flex-1"
                  disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editFormData.username}
                  onChange={(e) =>
                    handleEditFormChange("username", e.target.value)
                  }
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    handleEditFormChange("email", e.target.value)
                  }
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editFormData.firstName}
                  onChange={(e) =>
                    handleEditFormChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editFormData.lastName}
                  onChange={(e) =>
                    handleEditFormChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => handleEditFormChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEditUser}
                  className="flex-1"
                  disabled={editUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={editUserMutation.isPending}
                >
                  {editUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update User
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Multiple Users
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedUsers.size} user(s) and all their associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-3">
                Users to be deleted ({selectedUsers.size}):
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {getSelectedUsersData().map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-xs">
                        {user.firstName?.[0] || user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-red-900 dark:text-red-100">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username}
                    </span>
                    <span className="text-red-700 dark:text-red-300">
                      ({user.email})
                    </span>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="ml-auto"
                    >
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">
                This will delete for each user:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>User account and profile</li>
                <li>All farming data (fields, crops)</li>
                <li>Marketplace listings and activity</li>
                <li>Notifications and settings</li>
                <li>Authentication and security data</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={cancelBulkDelete}
                className="flex-1"
                disabled={bulkDeleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                className="flex-1"
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting {selectedUsers.size} Users...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedUsers.size} Users
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
