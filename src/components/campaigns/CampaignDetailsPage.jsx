import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { BaseLoading } from "../../components/BaseLoading";
import {
  useLocation,
  useNavigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { fetchReports } from "../../features/reports/reportsSlice";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import SortableTable from "../ui/sortable-table";
import API, { apiService } from "../../config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const CampaignDetailsPage = () => {
  const { state } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(state?.campaign || null);
  const [loading, setLoading] = useState(true);
  const { bulkId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (token && bulkId) {
      setLoading(true);
      dispatch(fetchReports({ token, filters: { bulk_id: bulkId } }))
        .unwrap()
        .then((res) => {
          if (res.messages && res.messages.length > 0) {
            const msg = res.messages[0];
            const audienceSize = msg.contactDetails?.length || 0;

            const messageLog =
              msg.contactDetails?.map((contact, index) => ({
                id: contact.id,
                sr: index + 1,
                contactName: contact.name,
                phone: contact.phone,
                campaignName: msg.campaignName,
                templateName: msg.templateDetails?.name,
                sendingDate: msg.sendingDate,
                status: contact.delivery_status?.status || "pending", // ✅ Actual delivery status
              })) || [];

            // Debug: Log actual statuses to understand the data
            console.log(
              "Message statuses:",
              messageLog.map((m) => m.status)
            );

            const deliverySummary = messageLog.reduce(
              (acc, contact) => {
                acc.total++;

                switch (contact.status?.toLowerCase()) {
                  case "completed":
                    acc.completed++;
                    break;

                  case "sent":
                    acc.sent++;
                    acc.completed++;
                    break;

                  case "delivered":
                    acc.delivered++;
                    acc.completed++;
                    break;

                  case "read":
                    acc.read++;
                    acc.completed++;
                    break;

                  case "failed":
                    acc.failed++;
                    break;

                  case "pending":
                  case "scheduled":
                  default:
                    acc.pending++;
                    break;
                }

                return acc;
              },
              {
                completed: 0,
                pending: 0,
                sent: 0,
                delivered: 0,
                read: 0,
                failed: 0,
                total: 0,
              }
            );

            // Debug: Log delivery summary calculation
            console.log("Delivery summary:", deliverySummary);

            setCampaign({
              name: msg.campaignName,
              status: msg.status,
              sent: msg.status === "completed" ? audienceSize : 0,
              read: 0,
              failed: msg.status === "failed" ? audienceSize : 0,
              messageLog,
              delivery_summary: deliverySummary,
            });
          } else {
            setCampaign(null);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [token, bulkId, dispatch]);

  const handleStatusSend = async () => {
    try {
      setSending(true);
      // const formdata = new FormData();
      // // formdata.append("status", selectedStatus);
      // formdata.append("bulk_id", bulkId);

      const response = await apiService.post(
        `${API.ENDPOINTS.SEND_REPORT}/${bulkId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Status updated:", response.data);
      dispatch(fetchReports({ token, filters: { bulk_id: bulkId } }));
      toast.success("Status updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Failed to update status.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <BaseLoading message="Loading..." />;
  if (!campaign)
    return (
      <p className="text-center mt-8">No campaign found for bulk_id={bulkId}</p>
    );

  const calculateDeliveryRate = (c) =>
    c.sent === 0 ? 0 : Math.round((c.sent / c.sent) * 100);
  const calculateReadRate = (c) =>
    c.sent === 0 ? 0 : Math.round((c.read / c.sent) * 100);

  const columns = [
    {
      key: "sr",
      label: "Sr.",
      className: "w-16",
      render: (_, row) => row.sr,
    },
    {
      key: "contactName",
      label: "Contact Name",
      className: "min-w-[150px]",
      render: (_, row) => row.contactName || "-",
    },
    {
      key: "phone",
      label: "Mobile Number",
      className: "min-w-[130px]",
      render: (_, row) => row.phone || "-",
    },
    {
      key: "templateName",
      label: "Template Name",
      className: "min-w-[150px]",
      render: (_, row) => row.templateName || "-",
    },
    {
      key: "sendingDate",
      label: "Sending Date",
      className: "min-w-[120px]",
      render: (_, row) =>
        row.sendingDate ? format(new Date(row.sendingDate), "dd/MM/yyyy") : "-",
    },
    {
      key: "status",
      label: "Status",
      className: "min-w-[100px]",
      render: (_, row) => {
        const statusConfig = {
          sent: {
            color: "bg-green-500 hover:bg-green-600 text-white",
            icon: CheckCircle2,
          },
          read: {
            color: "bg-yellow-500 hover:bg-yellow-600 text-black",
            icon: Eye,
          },
          failed: {
            color:
              "bg-destructive hover:bg-destructive/80 text-destructive-foreground",
            icon: XCircle,
          },
          pending: {
            color: "bg-muted hover:bg-muted text-foreground",
            icon: Clock,
          },
          scheduled: {
            color: "bg-primary hover:bg-primary text-primary-foreground",
            icon: Clock,
          },
          completed: {
            color: "bg-success hover:bg-success text-success-foreground",
            icon: CheckCircle,
          },
        };

        const config = statusConfig[row.status] || statusConfig["pending"];
        const Icon = config.icon;
        const label =
          row.status === "completed"
            ? "sent"
            : row.status.charAt(0).toUpperCase() + row.status.slice(1);
        return (
          <Badge
            className={cn(
              config.color,
              "flex items-center gap-1 capitalize justify-center"
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 mb-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <BarChart3 className="w-5 h-5 ml-0 sm:ml-4" />
        </div>
        <h1 className="text-2xl font-bold ml-0 sm:ml-2">
          {campaign.name} - Campaign Details
        </h1>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {campaign.delivery_summary.completed}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-xs text-muted-foreground">
              {campaign.delivery_summary.total > 0
                ? `${Math.round(
                    (campaign.delivery_summary.completed /
                      campaign.delivery_summary.total) *
                      100
                  )}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {campaign.delivery_summary.read}
            </div>
            <div className="text-sm text-muted-foreground">Read</div>
            <div className="text-xs text-muted-foreground">
              {campaign.delivery_summary.total > 0
                ? `${Math.round(
                    (campaign.delivery_summary.read /
                      campaign.delivery_summary.total) *
                      100
                  )}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {campaign.delivery_summary.delivered}
            </div>
            <div className="text-sm text-muted-foreground">Delivered</div>
            <div className="text-xs text-muted-foreground">
              {campaign.delivery_summary.total > 0
                ? `${Math.round(
                    (campaign.delivery_summary.delivered /
                      campaign.delivery_summary.total) *
                      100
                  )}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {campaign.delivery_summary.pending}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-xs text-muted-foreground">
              {campaign.delivery_summary.total > 0
                ? `${Math.round(
                    (campaign.delivery_summary.pending /
                      campaign.delivery_summary.total) *
                      100
                  )}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {campaign.delivery_summary.failed}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
            <div className="text-xs text-muted-foreground">
              {campaign.delivery_summary.total > 0
                ? `${Math.round(
                    (campaign.delivery_summary.failed /
                      campaign.delivery_summary.total) *
                      100
                  )}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resend Messages</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This will resend all messages that failed or are still pending.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusSend} disabled={sending}>
              {sending ? "Resending..." : "Resend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            {/* Title */}
            <div className="font-medium text-sm sm:text-base">Message Logs</div>
            {/* Resend Button */}
            {(campaign.delivery_summary.failed > 0 ||
              campaign.delivery_summary.pending > 0) && (
              <div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-1 w-full sm:w-auto justify-center"
                >
                  <Send className="w-4 h-4" /> Resend Messages (Failed/Pending)
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <SortableTable
            data={campaign.messageLog}
            columns={columns}
            itemsPerPage={10}
          />
        </CardContent>
      </Card>
    </div>
  );
};
