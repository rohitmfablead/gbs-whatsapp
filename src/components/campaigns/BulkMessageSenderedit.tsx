import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Send,
  FileText,
  Clock,
  Target,
  Tag,
  Folder,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTemplate } from "../../features/templates/templatesSlice";
import { fetchContacts } from "../../features/contacts/contactSlice";
import { ContactSelectionModal } from "./ContactSelectionModal";
import { fetchGroups } from "../../features/groups/groupSlice";
import { getReportById } from "../../features/reports/reportsSlice";
import { useNavigate, useParams } from "react-router-dom";
import { ContactSelectionCardedit } from "../ContactSelectionCardedit";
import { editScheduledCampaign } from "../../features/bulkSend/bulkSendSlice";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  status: string;
  groupIds: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  members: Array<{
    id: string;
    name: string;
    phone: string;
  }>;
}

interface TemplateComponent {
  type: string;
  text?: string;
  format?: string;
  example?: {
    header_handle?: string[];
    body_text?: string[][];
  };
  buttons?: Array<{
    type: string;
    text?: string;
    url?: string;
  }>;
}

interface Template {
  id: string;
  name: string;
  components: TemplateComponent[];
  category: string;
  language: string;
  status: string;
  isCustom: boolean;
}

const specificTemplateNames = [
  "poster_details",
  "opening_with_poster",
  "opening",
  "opening_with_video",
  "video_details",
  "grand_tapi_video_info",
  "grand_tapi_video_contact",
  "grand_tapi_photo_info",
  "grand_tapi_photo_contact",
  "beingyou_intro_with_poster",
  "beingyou_intro",
  "beingyou_naturalcare_event_with_poster",
];

export const BulkMessageSenderedit: React.FC = () => {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const { id } = useParams(); // Get campaign ID from URL
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: any) => state.auth);
  const { items: templates = [] } = useSelector((state: any) => state.template);
  const { list: contacts = [] } = useSelector((state: any) => state.contacts);
  const { items: groups = [] } = useSelector((state: any) => state.groups);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);
  const [filterTag, setFilterTag] = useState<string>("all");
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [name, setname] = useState("");
  const [openModalForVariable, setOpenModalForVariable] = useState<
    string | null
  >(null);

  // Create a map of group members for quick lookup
  const groupMembersMap = useMemo(() => {
    const map = new Map<string, string[]>();
    groups.forEach((group) => {
      const memberIds = group.members?.map((member) => member.id) || [];
      map.set(group.id, memberIds);
    });
    return map;
  }, [groups]);

  // Create a map of contact to groups for display
  const contactGroupsMap = useMemo(() => {
    const map = new Map<string, Group[]>();
    contacts.forEach((contact) => {
      const contactGroups = groups.filter((group) =>
        group.members?.some((member) => member.id === contact.id)
      );
      map.set(contact.id, contactGroups);
    });
    return map;
  }, [contacts, groups]);
  const handleRightScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollBy({
        top: e.deltaY, // scroll by the wheel amount
        behavior: "smooth", // smooth scrolling
      });
    }
  };

  // useEffect(() => {
  //   const loadData = async () => {
  //     if (!token) return;

  //     try {
  //       // ✅ First, load templates, contacts, and groups
  //       await Promise.all([
  //         dispatch(fetchUserTemplate(token)),
  //         dispatch(fetchContacts(token)),
  //         dispatch(fetchGroups(token)),
  //       ]);

  //       // ✅ Then, load campaign by ID
  //       if (id) {
  //         await dispatch(getReportById({ token, id }));
  //       }
  //     } catch (err) {
  //       console.error("Error loading campaign data:", err);
  //     }
  //   };

  //   loadData();
  // }, [dispatch, token, id]);

  // Update filtered contacts when contacts or filters change

  // 1️⃣ Load templates, contacts, groups on mount
  useEffect(() => {
    if (!token) return;
    Promise.all([
      dispatch(fetchUserTemplate(token)),
      dispatch(fetchContacts(token)),
      dispatch(fetchGroups(token)),
    ]);
  }, [dispatch, token]);

  useEffect(() => {
    const loadCampaign = async () => {
      if (!token || !id || templates.length === 0) return;

      try {
        const resultAction = await dispatch(getReportById({ token, id }));
        const data = resultAction.payload;

        if (data && data.messages && data.messages.length > 0) {
          const campaign = data.messages[0];
          const template = campaign.templateDetails;
          const campaignContacts = campaign.contactDetails || [];

          // ✅ 1. Prefill campaign name
          setname(campaign.campaignName || "");

          // ✅ 2. Prefill template (match by name if exists)
          const foundTemplate = templates.find((t) => t.name === template.name);
          setSelectedTemplate(foundTemplate || template);

          // ✅ 3. Prefill selected contacts from campaignDetails
          if (Array.isArray(campaignContacts) && campaignContacts.length > 0) {
            // Normalize numbers (remove spaces, +, etc.)
            const normalize = (num) => num?.replace(/[^\d]/g, "") || "";

            // Step 1: Match with existing Redux contacts
            const matchedContacts = contacts.filter((contact) =>
              campaignContacts.some(
                (cc) =>
                  cc.id === contact.id ||
                  normalize(cc.phone) === normalize(contact.phone)
              )
            );

            // Step 2: Identify missing contacts that are not in Redux
            const existingIds = new Set(matchedContacts.map((c) => c.id));
            const missingContacts = campaignContacts
              .filter((cc) => !existingIds.has(cc.id))
              .map((cc) => ({
                id: cc.id.toString(),
                name: cc.name || "Unnamed Contact",
                phone: cc.phone,
                email: cc.email || "",
                tags: cc.tags || [],
                status: cc.status || "active",
              }));

            // Step 3: Merge both sets
            const finalContacts = [...matchedContacts, ...missingContacts];

            // ✅ Step 4: Update states
            setFilteredContacts((prev) => {
              // merge without duplicates
              const unique = [
                ...prev,
                ...missingContacts.filter(
                  (mc) =>
                    !prev.some((p) => p.id.toString() === mc.id.toString())
                ),
              ];
              return unique;
            });

            // ✅ Store selected contact IDs
            setSelectedContacts(finalContacts.map((c) => c.id.toString()));
          }

          // ✅ 4. Prefill variables from template & campaign details
          const variables: Record<string, string> = {};

          // Extract all placeholders from the template body
          const bodyComponent = template.components.find(
            (c) => c.type === "BODY"
          );
          const headerComponent = template.components.find(
            (c) => c.type === "HEADER"
          );

          const bodyVars = bodyComponent?.text?.match(/\{\{(\d+)\}\}/g) || [];

          // Get variables array from backend (like ["contact::name"])
          const backendVars = campaign.campaignDetails?.variables || [];

          // Map backend variables to template placeholders ({{1}}, {{2}}, etc.)
          bodyVars.forEach((placeholder, index) => {
            const backendVar = backendVars[index] || "";
            variables[placeholder] = backendVar || `{{${index + 1}}}`;
          });

          // ✅ Prefill header media URL if available
          if (
            headerComponent &&
            headerComponent.format !== "TEXT" &&
            Array.isArray(campaign.campaignDetails?.headerVariables) &&
            campaign.campaignDetails.headerVariables.length > 0
          ) {
            variables["{{header_media_url}}"] =
              campaign.campaignDetails.headerVariables[0];
          }

          setVariableValues(variables);

          // // ✅ 5. Prefill Schedule Time from campaignDetails.scheduleAt
          if (campaign.campaignDetails?.scheduleAt) {
            setIsScheduled(true);

            // Convert UTC to local time compatible with datetime-local input
            const scheduleDate = new Date(campaign.campaignDetails.scheduleAt);
            const offset = scheduleDate.getTimezoneOffset();
            const localDate = new Date(
              scheduleDate.getTime() - offset * 60 * 1000
            );

            // Format -> YYYY-MM-DDTHH:mm
            const formattedDate = localDate.toISOString().slice(0, 16);

            setScheduledTime(formattedDate);
          }
        }
      } catch (err) {
        console.error("❌ Error loading campaign data:", err);
        toast.error("Failed to load campaign details");
      } finally {
        setLoadingCampaign(false);
      }
    };

    loadCampaign();
  }, [dispatch, token, id, templates.length, contacts]);

  useEffect(() => {
    let filtered = contacts.filter((contact) => {
      const matchesSearch =
        searchTerm === "" ||
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm);

      const matchesTag =
        filterTag === "all" || contact.tags.includes(filterTag);

      // For group filtering, check if contact is in any of the selected groups
      const matchesGroups =
        filterGroups.length === 0 ||
        filterGroups.some((groupId) =>
          groupMembersMap.get(groupId)?.includes(contact.id)
        );

      return matchesSearch && matchesTag && matchesGroups;
    });
    setFilteredContacts(filtered);
  }, [searchTerm, filterTag, filterGroups, contacts, groupMembersMap]);

  // When filterGroups change, auto-select all members from selected groups
  // without removing users' manual deselections that are outside these groups
  useEffect(() => {
    if (filterGroups.length === 0) return;

    const memberIdsFromGroups = new Set<string>();
    filterGroups.forEach((groupId) => {
      (groupMembersMap.get(groupId) || []).forEach((id) =>
        memberIdsFromGroups.add(id)
      );
    });

    setSelectedContacts((prev) => {
      // Merge previously selected with new group members
      const merged = new Set<string>(prev);
      memberIdsFromGroups.forEach((id) => merged.add(id));
      return Array.from(merged);
    });
  }, [filterGroups, groupMembersMap]);

  // Extract variables from the template
  const extractVariables = (template: Template) => {
    const bodyVariables: string[] = [];
    const buttonVariables: string[] = [];
    const headerVariables: string[] = [];

    template.components.forEach((component) => {
      if (component.type === "HEADER") {
        if (component.format !== "TEXT") {
          if (component.text) {
            headerVariables.push("{{header_text}}");
          } else if (
            component.format === "IMAGE" ||
            component.format === "VIDEO" ||
            component.format === "DOCUMENT"
          ) {
            headerVariables.push("{{header_media_url}}");
          }
        }
      } else if (component.type === "BODY") {
        const textVariables = component.text?.match(/\{\{(\d+)\}\}/g) || [];
        bodyVariables.push(...textVariables);
      } else if (
        component.type === "BUTTONS" &&
        !specificTemplateNames.includes(template.name)
      ) {
        component.buttons?.forEach((button) => {
          const buttonTextVariables =
            button.text?.match(/\{\{(\d+)\}\}/g) || [];
          const buttonUrlVariables = button.url?.match(/\{\{(\d+)\}\}/g) || [];
          buttonVariables.push(...buttonTextVariables, ...buttonUrlVariables);
        });
      }
    });

    // Assign distinct numbers to button variables
    const uniqueButtonVariables = [...new Set(buttonVariables)];
    const numberedButtonVariables = uniqueButtonVariables.map(
      (variable, index) => {
        const buttonIndex = index + bodyVariables.length + 1;
        return variable.replace(/\d+/, buttonIndex.toString());
      }
    );

    return {
      headerVariables,
      bodyVariables: [...new Set(bodyVariables)],
      buttonVariables: numberedButtonVariables,
    };
  };

  // Generate a preview of the message
  const generatePreview = () => {
    if (!selectedTemplate) return "";
    let preview = "";
    const { bodyVariables, buttonVariables, headerVariables } =
      extractVariables(selectedTemplate);

    selectedTemplate.components.forEach((component) => {
      switch (component.type) {
        case "HEADER":
          preview += `
      <div class="p-3 bg-blue-50 rounded-t-lg border-b border-blue-200">
        <div class="text-xs font-semibold text-blue-800 uppercase">HEADER</div>
    `;

          if (component.format === "TEXT") {
            const headerText =
              variableValues["{{header_text}}"] || component.text || "";
            preview += `<div class="mt-1">${headerText}</div>`;
          } else if (
            component.format === "IMAGE" ||
            component.format === "VIDEO" ||
            component.format === "DOCUMENT"
          ) {
            const mediaUrl =
              variableValues["{{header_media_url}}"] ||
              component.example?.header_handle?.[0] ||
              "";

            if (component.format === "IMAGE") {
              preview += `
          <div class="mt-2">
            <img src="${mediaUrl}" alt="Header Image" class="w-full rounded-lg object-cover" />
          </div>
        `;
            } else if (component.format === "VIDEO") {
              preview += `
       <div class="mt-2 flex justify-center">
  <video controls class="w-full max-w-xs rounded-lg">
    <source src="${mediaUrl}" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>
        `;
            } else if (component.format === "DOCUMENT") {
              preview += `
          <div class="mt-2 text-sm text-blue-700">
            <a href="${mediaUrl}" target="_blank" class="underline text-blue-600">
              View Document
            </a>
          </div>
        `;
            }
          }

          preview += `</div>`;
          break;
        case "BODY":
          let bodyText = component.text || "";
          bodyVariables.forEach((variable) => {
            const value = variableValues[variable] || variable;
            bodyText = bodyText.replace(
              new RegExp(variable.replace(/[{}]/g, "\\$&"), "g"),
              value
            );
          });
          preview += `<div class="p-3">${bodyText}</div>`;
          break;
        case "BUTTONS":
          component.buttons?.forEach((button) => {
            let buttonText = button.text || "";
            buttonVariables.forEach((variable) => {
              const value = variableValues[variable] || variable;
              buttonText = buttonText.replace(
                new RegExp(variable.replace(/[{}]/g, "\\$&"), "g"),
                value
              );
            });
            preview += `<div class="p-3"><button class="bg-blue-500 text-white p-2 rounded">${buttonText}</button></div>`;
          });
          break;
      }
    });
    return preview;
  };

  // Toggle contact selection
  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Select/deselect all contacts
  const handleSelectAll = () => {
    if (selectedContacts.length > 0) {
      // Clear both selections and groups to avoid re-auto-select
      setSelectedContacts([]);
      setFilterGroups([]);
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id));
    }
  };

  // Handle selecting multiple contacts
  const handleSelectContacts = (contactIds: string[]) => {
    setSelectedContacts(contactIds);
  };

  // Select all members of a group
  const handleSelectGroup = (groupId: string) => {
    const memberIds = groupMembersMap.get(groupId) || [];
    setSelectedContacts((prev) => {
      // If all members are already selected, deselect them
      if (memberIds.every((id) => prev.includes(id))) {
        return prev.filter((id) => !memberIds.includes(id));
      }
      // Otherwise select all members
      return [...new Set([...prev, ...memberIds])];
    });
  };

  // Check if all members of a group are selected
  const areAllGroupMembersSelected = (groupId: string) => {
    const memberIds = groupMembersMap.get(groupId) || [];
    return (
      memberIds.length > 0 &&
      memberIds.every((id) => selectedContacts.includes(id))
    );
  };

  // Get group name from group ID
  const getGroupName = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.name : "Unknown Group";
  };

  // Get group members
  const getGroupMembers = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.members || [] : [];
  };

  // Handle sending the bulk message
  const handleSend = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) {
      toast.error("Please select a template and contacts");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    const { headerVariables, bodyVariables, buttonVariables } =
      extractVariables(selectedTemplate);

    // Check for missing variables
    const allVariables = [
      ...headerVariables,
      ...bodyVariables,
      ...buttonVariables,
    ];
    const missingVariables = allVariables.filter(
      (variable) => !variableValues[variable]?.trim()
    );

    if (missingVariables.length > 0) {
      toast.error(
        `Please fill in all required variables: ${missingVariables.join(", ")}`
      );
      return;
    }

    setIsSending(true);
    setSendingProgress(0);

    // Start progress simulation
    const progressInterval = setInterval(() => {
      setSendingProgress((prev) => {
        if (prev >= 90) {
          return prev; // Stop at 90% until API call completes
        }
        return prev + Math.random() * 15; // Increment by random amount between 0-15
      });
    }, 200); // Update every 200ms

    try {
      // Format button variables based on template type
      let formattedButtonVariables: string[] = [];

      if (specificTemplateNames.includes(selectedTemplate.name)) {
        // For specific templates, directly push "redirectwhatsapp"
        formattedButtonVariables.push("redirectwhatsapp");
      } else {
        // For other templates, map button variables to their values
        formattedButtonVariables = buttonVariables.map(
          (variable) => variableValues[variable] || ""
        );
      }

      // Format body variables
      const formattedBodyVariables = bodyVariables.map(
        (variable) => variableValues[variable] || ""
      );

      // Format header variables
      const formattedHeaderVariables = headerVariables.map(
        (variable) => variableValues[variable] || ""
      );

      const payload = {
        name,
        templateId: selectedTemplate.id,
        headerVariables: formattedHeaderVariables,
        bodyVariables: formattedBodyVariables,
        buttonVariables: formattedButtonVariables,
        scheduleAt: isScheduled ? scheduledTime : null,
        contactIds: selectedContacts,
      };

      const resultAction = await dispatch(
        editScheduledCampaign({ token, id, groupData: payload })
      );

      // Clear the progress interval
      clearInterval(progressInterval);

      // Complete the progress bar
      setSendingProgress(100);

      // Wait a moment to show 100% completion
      setTimeout(() => {
        if (editScheduledCampaign.fulfilled.match(resultAction)) {
          toast.success(
            `Campaign "${name}" sent successfully to ${selectedContacts.length} contacts!`
          );
          navigate("/campaigns");
        } else {
          const errorMessage =
            (resultAction.payload as { error?: string })?.error ||
            (resultAction.payload as string) ||
            "Failed to send campaign";
          toast.error(errorMessage);
        }
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      toast.error("An error occurred while sending the campaign");
    } finally {
      // Reset after a delay to show completion
      setTimeout(() => {
        setIsSending(false);
        setSendingProgress(0);
        setSelectedTemplate(null);
        setSelectedContacts([]);
        setVariableValues({});
        setname("");
      }, 2000);
    }
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(contacts.flatMap((contact) => contact.tags))
  );

  if (loadingCampaign) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container  max-w-7xl mx-auto px-4">
      <div className="grid gap-6 lg:grid-cols-3 lg:h-[calc(100vh-6rem)] overflow-hidden">
        {/* Configuration */}
        <div
          className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 hide-scrollbar"
          ref={leftPanelRef}
        >
          {" "}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          {/* Campaign Setup */}
          <Card className="card-elegant">
            <div className="relative  px-6 py-4  flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-b-2 border-gray-300">
              <div className="flex items-center space-x-4">
                {/* Optional icon */}

                <div>
                  <h1 className="text-3xl font-extrabold text-blue-900">
                    {name
                      ? `Edit Campaign – ${name}`
                      : "Edit Scheduled Campaign"}
                  </h1>
                  <p className="text-blue-700 mt-1 sm:mt-2 text-sm sm:text-base">
                    Update your existing WhatsApp message campaign details
                  </p>
                </div>
              </div>
            </div>

            <CardHeader>
              <CardTitle>Edit Campaign Setup</CardTitle>
              <CardDescription>
                Modify your existing bulk message campaign details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  placeholder="Enter campaign name (e.g., Holiday Sale 2024)"
                />
                <div className="mt-1 border-l-4 border-blue-400 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  <span className="font-semibold">Example:</span> Product
                  Launch, Event Invitation, Holiday Sale 2025
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Template</Label>

                <Select
                  value={selectedTemplate?.id || ""}
                  onValueChange={(templateId) => {
                    const template = templates.find((t) => t.id === templateId);
                    setSelectedTemplate(template || null);
                    setVariableValues({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a message template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter((t) => t.status === "APPROVED")
                      .map((template) => (
                        <SelectItem
                          className="px-2 py-2"
                          key={template.id}
                          value={template.id}
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span className="truncate w-44 sm:w-48 md:w-96">
                              {template.name}
                            </span>{" "}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="space-y-4">
                  <Label>Template Variables</Label>
                  {(() => {
                    const { headerVariables, bodyVariables, buttonVariables } =
                      extractVariables(selectedTemplate);
                    const variableInfoMap: Record<
                      string,
                      {
                        type: string;
                        inputType: string;
                        placeholder: string;
                      }
                    > = {};

                    // Populate variableInfoMap for header variables
                    if (headerVariables.length > 0) {
                      const headerComponent = selectedTemplate.components.find(
                        (c) => c.type === "HEADER"
                      );
                      if (headerComponent) {
                        if (headerComponent.format !== "TEXT") {
                          if (headerComponent.text) {
                            variableInfoMap["{{header_text}}"] = {
                              type: "HEADER",
                              inputType: "text",
                              placeholder: "Enter header text content",
                            };
                          } else if (
                            headerComponent.format === "IMAGE" ||
                            headerComponent.format === "VIDEO" ||
                            headerComponent.format === "DOCUMENT"
                          ) {
                            variableInfoMap["{{header_media_url}}"] = {
                              type: "HEADER",
                              inputType: "url",
                              placeholder: `Enter URL for header ${headerComponent.format.toLowerCase()}`,
                            };
                          }
                        }
                      }
                    }

                    // Populate variableInfoMap for body variables
                    bodyVariables.forEach((variable) => {
                      variableInfoMap[variable] = {
                        type: "BODY",
                        inputType: "text",
                        placeholder: `Enter value for ${variable}`,
                      };
                    });

                    // Populate variableInfoMap for button variables
                    buttonVariables.forEach((variable) => {
                      variableInfoMap[variable] = {
                        type: "BUTTONS",
                        inputType: variable.includes("url") ? "url" : "text",
                        placeholder: variable.includes("url")
                          ? `Enter URL for ${variable}`
                          : `Enter button text for ${variable}`,
                      };
                    });

                    return (
                      <>
                        {/* Header Variables Section */}
                        {headerVariables.length > 0 && (
                          <Card className="mb-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Header Content
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-1">
                                {headerVariables.includes(
                                  "{{header_media_url}}"
                                ) ? (
                                  <>
                                    <Input
                                      type="url"
                                      value={
                                        variableValues[
                                          "{{header_media_url}}"
                                        ] || ""
                                      }
                                      onChange={(e) => {
                                        setVariableValues({
                                          ...variableValues,
                                          "{{header_media_url}}":
                                            e.target.value,
                                        });
                                      }}
                                      placeholder="Enter URL for header media"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Enter a valid URL for your header media
                                    </p>
                                  </>
                                ) : (
                                  <Input
                                    type="text"
                                    value={
                                      variableValues["{{header_text}}"] || ""
                                    }
                                    onChange={(e) => {
                                      setVariableValues({
                                        ...variableValues,
                                        "{{header_text}}": e.target.value,
                                      });
                                    }}
                                    placeholder="Enter header text content"
                                  />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Body Variables Section */}
                        {bodyVariables.length > 0 && (
                          <Card className="mb-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Body Variables
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {bodyVariables.map((variable) => {
                                const info = variableInfoMap[variable];
                                const handleInsertContact = (value: string) => {
                                  setVariableValues({
                                    ...variableValues,
                                    [variable]: value,
                                  });
                                  setOpenModalForVariable(null);
                                };
                                return (
                                  <div key={variable} className="space-y-1">
                                    <div className="flex items-center">
                                      <Label className="text-sm font-mono">
                                        {variable}
                                      </Label>
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 text-xs"
                                        style={{
                                          backgroundColor: "#f3f4f6",
                                          color: "#374151",
                                        }}
                                      >
                                        Body
                                      </Badge>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        type={info?.inputType || "text"}
                                        value={variableValues[variable] || ""}
                                        onChange={(e) =>
                                          setVariableValues({
                                            ...variableValues,
                                            [variable]: e.target.value,
                                          })
                                        }
                                        placeholder={
                                          info?.placeholder ||
                                          `Enter value for ${variable}`
                                        }
                                        className="pr-10"
                                      />
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="ghost"
                                              className="absolute right-0 top-0 h-full hover:bg-blue-500 hover:text-white rounded-r-md"
                                              onClick={() =>
                                                setOpenModalForVariable(
                                                  variable
                                                )
                                              }
                                            >
                                              <Users className="h-4 w-4 text-muted-foreground hover:text-white" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Select Contact Detail</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="mt-2 border-l-4 border-blue-400 bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                                      <span className="font-semibold">
                                        Note:
                                      </span>{" "}
                                      Value to replace
                                      <span className="font-mono">
                                        {variable}
                                      </span>{" "}
                                      in the message
                                    </div>

                                    {openModalForVariable === variable && (
                                      <ContactSelectionModal
                                        isOpen={
                                          openModalForVariable === variable
                                        }
                                        onOpenChange={(open) =>
                                          !open && setOpenModalForVariable(null)
                                        }
                                        onSelect={handleInsertContact}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </CardContent>
                          </Card>
                        )}

                        {/* Button Variables Section */}
                        {buttonVariables.length > 0 &&
                          !specificTemplateNames.includes(
                            selectedTemplate.name
                          ) && (
                            <Card className="mb-4">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Button Variables
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {buttonVariables.map((variable) => {
                                  const info = variableInfoMap[variable];
                                  return (
                                    <div key={variable} className="space-y-1">
                                      <div className="flex items-center">
                                        <Label className="text-sm font-mono">
                                          {variable}
                                        </Label>
                                        <Badge
                                          variant="secondary"
                                          className="ml-2 text-xs"
                                          style={{
                                            backgroundColor: "#ddd6fe",
                                            color: "#7c3aed",
                                          }}
                                        >
                                          Button
                                        </Badge>
                                      </div>
                                      <Input
                                        type={info?.inputType || "text"}
                                        value={variableValues[variable] || ""}
                                        onChange={(e) =>
                                          setVariableValues({
                                            ...variableValues,
                                            [variable]: e.target.value,
                                          })
                                        }
                                        placeholder={
                                          info?.placeholder ||
                                          `Enter value for ${variable}`
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </CardContent>
                            </Card>
                          )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Message Preview */}
              {selectedTemplate && (
                <div className="space-y-2">
                  <Label>Message Preview</Label>
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: generatePreview() }}
                    />
                  </div>
                </div>
              )}

              {/* Scheduling */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={isScheduled}
                  onCheckedChange={(checked) =>
                    setIsScheduled(checked as boolean)
                  }
                />
                <Label htmlFor="schedule">Schedule for later</Label>
              </div>
              {isScheduled && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Schedule Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16)} // disables past times
                  />
                </div>
              )}
            </CardContent>
          </Card>
          {/* Contact Selection */}
          <ContactSelectionCardedit
            contacts={contacts}
            groups={groups}
            selectedContacts={selectedContacts}
            onSelectContact={handleContactToggle}
            onSelectAll={handleSelectAll}
            onSelectContacts={handleSelectContacts}
            onSearch={setSearchTerm}
            onFilterGroups={setFilterGroups}
            searchTerm={searchTerm}
            filterGroups={filterGroups}
          />
        </div>

        {/* Summary & Send */}
        <div
          className="space-y-2 lg:col-span-1 overflow-y-auto"
          onWheel={handleRightScroll}
        >
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Campaign Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign</span>
                  <span className="text-foreground font-medium">
                    {name || "Untitled Campaign"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template</span>
                  <span className="text-foreground overflow-hidden text-ellipsis font-medium max-w-[150px]">
                    {selectedTemplate?.name || "None selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="text-foreground font-medium">
                    {selectedContacts.length} contacts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={isScheduled ? "secondary" : "default"}>
                    {isScheduled ? "Scheduled" : "Ready to Send"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {isSending && (
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Sending Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {Math.round(sendingProgress)}%
                      </span>
                    </div>
                    <Progress value={sendingProgress} className="w-full h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">
                        {sendingProgress < 100
                          ? "Sending messages..."
                          : "Completed!"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recipients</span>
                      <span className="font-medium">
                        {selectedContacts.length} contacts
                      </span>
                    </div>
                  </div>

                  {sendingProgress < 100 && (
                    <div className="text-xs text-muted-foreground text-center">
                      Please wait while we process your campaign...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="card-elegant">
            <CardContent className="p-6">
              <Button
                className="w-full bg-gradient-primary"
                size="lg"
                onClick={handleSend}
                disabled={
                  !selectedTemplate ||
                  selectedContacts.length === 0 ||
                  isSending ||
                  !name.trim()
                }
              >
                {isSending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {isScheduled ? "Schedule Campaign" : "Send Now"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Contacts</span>
                <span className="text-foreground">{contacts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Templates Available
                </span>
                <span className="text-foreground">{templates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected</span>
                <span className="text-primary font-medium">
                  {selectedContacts.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
