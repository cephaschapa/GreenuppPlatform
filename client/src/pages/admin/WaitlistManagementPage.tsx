import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Filter,
  Download,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WaitlistRegistration {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  userType: string;
  location: string;
  farmSize?: string;
  primaryCrops?: string;
  experience: string;
  interests: string[];
  additionalInfo?: string;
  status: string;
  registrationDate: string;
  invitedAt?: string;
  updatedAt: string;
}

interface WaitlistStats {
  total: number;
  recent: number;
  byUserType: Array<{ userType: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
}

export default function WaitlistManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] =
    useState<WaitlistRegistration | null>(null);

  // Fetch waitlist statistics
  const { data: stats } = useQuery<WaitlistStats>({
    queryKey: ["/api/waitlist/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/waitlist/stats");
      return response.json();
    },
  });

  // Fetch waitlist registrations
  const { data: registrationsData, isLoading } = useQuery({
    queryKey: [
      "/api/waitlist/registrations",
      search,
      statusFilter,
      userTypeFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (userTypeFilter !== "all") params.append("userType", userTypeFilter);

      const response = await apiRequest(
        "GET",
        `/api/waitlist/registrations?${params}`
      );
      return response.json();
    },
  });

  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/waitlist/registrations/${id}`,
        {
          status,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/waitlist/registrations"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist/stats"] });
      toast({
        title: "Status Updated",
        description: "Registration status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update registration status.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "invited":
        return (
          <Badge variant="outline" className="text-blue-600">
            <Mail className="w-3 h-3 mr-1" />
            Invited
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const colors = {
      farmer: "bg-green-100 text-green-800",
      buyer: "bg-blue-100 text-blue-800",
      supplier: "bg-purple-100 text-purple-800",
      distributor: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge
        variant="secondary"
        className={colors[userType as keyof typeof colors] || colors.other}
      >
        {userType}
      </Badge>
    );
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const exportData = () => {
    // Simple CSV export
    const csv = [
      [
        "Name",
        "Email",
        "User Type",
        "Location",
        "Status",
        "Registration Date",
      ].join(","),
      ...(registrationsData?.registrations || []).map(
        (reg: WaitlistRegistration) =>
          [
            `"${reg.firstName} ${reg.lastName}"`,
            reg.email,
            reg.userType,
            `"${reg.location}"`,
            reg.status,
            new Date(reg.registrationDate).toLocaleDateString(),
          ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `waitlist-registrations-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AdminLayout title="Waitlist Management">
      <div className="container max-w-7xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Testing Waitlist Management</h1>
            <p className="text-muted-foreground">
              Manage registrations for the GreenUpp testing program
            </p>
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Registrations
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Last 30 Days
                    </p>
                    <p className="text-2xl font-bold">{stats.recent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.byStatus.find((s) => s.status === "pending")
                        ?.count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Farmers
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.byUserType.find((s) => s.userType === "farmer")
                        ?.count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations</CardTitle>
            <CardDescription>
              View and manage testing program registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or organization..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Registrations Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrationsData?.registrations?.map(
                  (registration: WaitlistRegistration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.firstName} {registration.lastName}
                        {registration.organization && (
                          <div className="text-sm text-muted-foreground">
                            {registration.organization}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>
                        {getUserTypeBadge(registration.userType)}
                      </TableCell>
                      <TableCell>{registration.location}</TableCell>
                      <TableCell>
                        {getStatusBadge(registration.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          registration.registrationDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedRegistration(registration)
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {registration.firstName}{" "}
                                  {registration.lastName}
                                </DialogTitle>
                                <DialogDescription>
                                  Registration details and information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRegistration && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">
                                        Email
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedRegistration.email}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        Phone
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedRegistration.phone ||
                                          "Not provided"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        User Type
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedRegistration.userType}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        Experience
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedRegistration.experience}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        Farm Size
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedRegistration.farmSize ||
                                          "Not provided"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        Primary Crops
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedRegistration.primaryCrops ||
                                          "Not provided"}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Interests
                                    </label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedRegistration.interests.map(
                                        (interest) => (
                                          <Badge
                                            key={interest}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {interest.replace("-", " ")}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                  {selectedRegistration.additionalInfo && (
                                    <div>
                                      <label className="text-sm font-medium">
                                        Additional Information
                                      </label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedRegistration.additionalInfo}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                Update Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(registration.id, "invited")
                                }
                                disabled={registration.status === "invited"}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Mark as Invited
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    registration.id,
                                    "accepted"
                                  )
                                }
                                disabled={registration.status === "accepted"}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Mark as Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    registration.id,
                                    "rejected"
                                  )
                                }
                                disabled={registration.status === "rejected"}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Mark as Rejected
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>

            {registrationsData?.registrations?.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No registrations found
                </h3>
                <p className="text-muted-foreground">
                  No waitlist registrations match your current filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
