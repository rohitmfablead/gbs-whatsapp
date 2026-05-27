import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Send,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  ChevronLeft,
  Edit2,
  Trash,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SortableTable from "../components/ui/sortable-table";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRcapenight,
  fetchReports,
} from "../features/reports/reportsSlice";
import { BaseLoading } from "../components/BaseLoading";
import {
  deleteScheduledCampaign,
  editScheduledCampaign,
} from "../features/reports/reportsSlice";
import SortableTableDaynemic from "../components/ui/sortable-table-daynemic";

export const Campaigns = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: reportsData, loading } = useSelector((state) => state.reports);
  const { token } = useSelector((state) => state.auth);
  const [campaigns, setCampaigns] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // ✅ Fetch reports whenever status or page changes
  useEffect(() => {
    if (token) {
      dispatch(
        fetchRcapenight({ token, filters: { status: statusFilter, page } })
      );
    }
  }, [dispatch, token, statusFilter, page]);

  // ✅ Format reports for display
  useEffect(() => {
    if (reportsData && reportsData.messages) {
      const formatted = reportsData.messages.map((msg) => ({
        id: msg.bulk_id,
        name: msg.campaignName,
        template: msg.templateDetails?.name || "N/A",
        status: msg.status,
        audienceSize: msg.audienceSize || 0,
        createdAt: new Date(msg.sendingDate).toLocaleDateString(),
        scheduleAt: msg.scheduleAt
          ? new Date(msg.scheduleAt).toLocaleString()
          : null,
      }));
      setCampaigns(formatted);
      setTotalPages(reportsData.totalPages || 1); // API must return totalPages
    }
  }, [reportsData]);

  const columns = [
    {
      key: "name",
      label: "Campaign Name",
      render: (value, item) => (
        <div>
          <div className="font-medium">{value}</div>

          {/* Show Created or Scheduled Date based on statusFilter */}
          {statusFilter === "scheduled" ? (
            item.scheduleAt ? (
              <div className="text-sm text-muted-foreground hidden sm:block">
                Scheduled: {item.scheduleAt}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground hidden sm:block">
                Scheduled: Not Set
              </div>
            )
          ) : (
            <div className="text-sm text-muted-foreground hidden sm:block">
              Created: {item.createdAt}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "template",
      label: "Template",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "audienceSize",
      label: "Audience Size",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          className={`capitalize ${
            value === "completed"
              ? "bg-green-100 text-green-700 border-green-300"
              : value === "failed"
              ? "bg-red-100 text-red-700 border-red-300"
              : value === "scheduled"
              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
              : "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {value}
        </Badge>
      ),
    },
  ];

  const onRowAction = (item) => {
    return (
      <div className="flex justify-start gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/campaigns-details/${item.id}`, {
              state: { campaign: item },
            });
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>

        {/* Only show Edit/Delete if statusFilter === "scheduled" */}
        {statusFilter === "scheduled" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/bulk-send-edit/${item.id}`, {
                  state: { campaign: item },
                });
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCampaign(item);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash className="w-4 h-4 " />
            </Button>
          </>
        )}
      </div>
    );
  };

  if (loading) return <BaseLoading message="Loading campaigns..." />;

  return (
    <div className="container max-w-7xl mx-auto px-4">
      {/* =================== Edit Modal =================== */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedCampaign(null);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reschedule Campaign</DialogTitle>
            <DialogDescription>
              Set a new date and time for{" "}
              <strong>{selectedCampaign?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Date-Time Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full border border-input rounded-md p-2 text-sm bg-muted/10 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={selectedCampaign?.scheduleTime || ""}
                onChange={(e) =>
                  setSelectedCampaign({
                    ...selectedCampaign,
                    scheduleTime: e.target.value,
                  })
                }
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // prepare JSON payload (convert datetime-local to API format if needed)
                  const payload = {
                    scheduleAt: selectedCampaign?.scheduleTime || "", // or format as required
                  };

                  dispatch(
                    editScheduledCampaign({
                      token,
                      id: selectedCampaign?.id,
                      payload,
                    })
                  );

                  // Auto close + clear
                  setIsEditModalOpen(false);
                  setSelectedCampaign(null);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* =================== Delete Modal =================== */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setSelectedCampaign(null);
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedCampaign?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedCampaign?.id) return;

                try {
                  // 🧹 1. Delete the campaign first
                  const result = await dispatch(
                    deleteScheduledCampaign({ token, id: selectedCampaign.id })
                  );

                  // 🧭 2. Check if deletion was successful before reloading
                  if (result.meta.requestStatus === "fulfilled") {
                    // ✅ Refresh the campaign list after successful deletion
                    await dispatch(
                      fetchRcapenight({
                        token,
                        filters: { status: statusFilter, page },
                      })
                    );

                    // 🧾 Optional: show success message (if you use toast)
                    toast.success("Campaign deleted successfully");
                  } else {
                    // ❌ Optional: show error
                    toast.error("Failed to delete campaign");
                  }
                } catch (error) {
                  console.error("Error deleting campaign:", error);
                  // toast.error("An unexpected error occurred");
                } finally {
                  // 🔚 Close modal and clear selection
                  setIsDeleteModalOpen(false);
                  setSelectedCampaign(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage and monitor your WhatsApp campaigns
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Campaigns
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {reportsData?.summary?.totalCampaigns || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Send className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {reportsData?.summary?.completedCampaigns || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {reportsData?.summary?.failedCampaigns || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Scheduled
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reportsData?.summary?.scheduled || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Campaign Table */}
      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            {/* Right Section — Filter Tabs */}
            <div className="flex  flex-col sm:flex-row sm:items-center gap-2">
              <strong className="text-sm font-medium text-muted-foreground">
                Filter by Status:
              </strong>

              <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                defaultValue="all"
                className="w-fit"
              >
                <TabsList className="bg-muted p-1 rounded-lg">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium transition-all"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="scheduled"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-1.5 text-sm font-medium transition-all"
                  >
                    Scheduled
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <SortableTableDaynemic
            data={campaigns}
            columns={columns}
            onRowAction={onRowAction}
            onRowClick={(item) =>
              navigate(`/campaigns-details/${item.id}`, {
                state: { campaign: item },
              })
            }
            rowClassName="cursor-pointer"
            showColumn1Mobile={false}
          />
          {/* Pagination */}
          {reportsData?.pagination && reportsData?.messages?.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 border-t border-border pt-4">
              {/* Showing summary */}
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {reportsData.pagination.from}
                </span>
                –
                <span className="font-medium text-foreground">
                  {reportsData.pagination.to}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {reportsData.pagination.total}
                </span>{" "}
                campaigns
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reportsData.pagination.current_page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <span className="text-sm font-medium text-foreground">
                  Page {reportsData.pagination.current_page} of{" "}
                  {reportsData.pagination.last_page}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    reportsData.pagination.current_page ===
                    reportsData.pagination.last_page
                  }
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(prev + 1, reportsData.pagination.last_page)
                    )
                  }
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
