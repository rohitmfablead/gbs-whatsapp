import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Eye,
  Calendar as CalendarIcon,
  Send,
  CheckCircle,
  MessageSquare,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Select Template", icon: FileText },
  { id: 2, title: "Map Variables", icon: MessageSquare },
  { id: 3, title: "Select Audience", icon: Users },
  { id: 4, title: "Preview Messages", icon: Eye },
  { id: 5, title: "Schedule & Send", icon: Send },
];

export const CampaignWizard = ({
  templates,
  contacts,
  onComplete,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: "",
    templateId: "",
    variables: [],
    audienceType: "all",
    selectedContacts: [],
    filterTags: [],
    selectedGroup: "",
    scheduleType: "now",
    scheduledDate: undefined,
    scheduledTime: "09:00",
  });

  const selectedTemplate = templates.find(
    (t) => t.id === campaignData.templateId
  );

  const getPlaceholders = (body) => {
    const matches = body.match(/\{\{(\d+)\}\}/g);
    return matches ? matches.map((match) => match) : [];
  };

  const contactFields = [
    { value: "name", label: "Name" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "custom", label: "Custom Value" },
  ];

  const allTags = [...new Set(contacts.flatMap((c) => c.tags))];
  const allGroups = [...new Set(contacts.map((c) => c.group).filter(Boolean))];

  const getSelectedContacts = () => {
    if (campaignData.audienceType === "all") {
      return contacts;
    } else if (campaignData.audienceType === "selected") {
      return contacts.filter((c) =>
        campaignData.selectedContacts.includes(c.id)
      );
    } else if (campaignData.audienceType === "filtered") {
      return contacts.filter((c) =>
        campaignData.filterTags.some((tag) => c.tags.includes(tag))
      );
    } else if (campaignData.audienceType === "group") {
      return contacts.filter((c) => c.group === campaignData.selectedGroup);
    }
    return [];
  };

  const generatePreviewMessages = () => {
    if (!selectedTemplate) return [];
    const selectedContacts = getSelectedContacts();
    return selectedContacts.slice(0, 5).map((contact) => {
      let message = selectedTemplate.body;
      campaignData.variables.forEach((variable) => {
        let value = "";
        if (variable.field === "name") value = contact.name;
        else if (variable.field === "phone") value = contact.phone;
        else if (variable.field === "email") value = contact.email;
        message = message.replace(variable.placeholder, value || "[VALUE]");
      });
      return { contact, message };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const finalCampaignData = {
      ...campaignData,
      selectedContacts: getSelectedContacts(),
      template: selectedTemplate,
      audienceSize: getSelectedContacts().length,
    };
    onComplete(finalCampaignData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={campaignData.name}
                  onChange={(e) =>
                    setCampaignData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter campaign name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Select Template</Label>
                <div className="grid gap-4 mt-2">
                  {templates
                    .filter((t) => t.status === "APPROVED")
                    .map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          campaignData.templateId === template.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() =>
                          setCampaignData((prev) => ({
                            ...prev,
                            templateId: template.id,
                          }))
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="outline">
                                {template.category}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {template.body}
                              </p>
                            </div>
                            {campaignData.templateId === template.id && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        if (!selectedTemplate) return <div>Please select a template first</div>;
        const placeholders = getPlaceholders(selectedTemplate.body);
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Map Template Variables</h3>
              <p className="text-sm text-muted-foreground">
                Map the variables in your template to contact fields
              </p>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Template Preview:
                  </Label>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedTemplate.body}
                  </p>
                </div>
              </CardContent>
            </Card>
            {placeholders.length > 0 ? (
              <div className="space-y-4">
                {placeholders.map((placeholder, index) => (
                  <div
                    key={placeholder}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-20">
                      <Badge variant="outline">{placeholder}</Badge>
                    </div>
                    <div className="flex-1">
                      <Select
                        value={
                          campaignData.variables.find(
                            (v) => v.placeholder === placeholder
                          )?.field || ""
                        }
                        onValueChange={(value) => {
                          setCampaignData((prev) => ({
                            ...prev,
                            variables: [
                              ...prev.variables.filter(
                                (v) => v.placeholder !== placeholder
                              ),
                              { placeholder, field: value },
                            ],
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field to map" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No variables to map in this template
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Select Audience</h3>
              <p className="text-sm text-muted-foreground">
                Choose who will receive this campaign
              </p>
            </div>
            <div className="space-y-4">
              {/* All Contacts */}
              <Card
                className={cn(
                  "cursor-pointer transition-colors",
                  campaignData.audienceType === "all"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() =>
                  setCampaignData((prev) => ({ ...prev, audienceType: "all" }))
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">All Contacts</h4>
                      <p className="text-sm text-muted-foreground">
                        {contacts.length} contacts
                      </p>
                    </div>
                    {campaignData.audienceType === "all" && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Filter by Tags */}
              <Card
                className={cn(
                  "cursor-pointer transition-colors",
                  campaignData.audienceType === "filtered"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() =>
                  setCampaignData((prev) => ({
                    ...prev,
                    audienceType: "filtered",
                  }))
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Filter by Tags</h4>
                      <p className="text-sm text-muted-foreground">
                        Select contacts with specific tags
                      </p>
                    </div>
                    {campaignData.audienceType === "filtered" && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  {campaignData.audienceType === "filtered" && (
                    <div className="mt-4">
                      <Label className="text-sm">Select Tags:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {allTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={
                              campaignData.filterTags.includes(tag)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() => {
                              setCampaignData((prev) => ({
                                ...prev,
                                filterTags: prev.filterTags.includes(tag)
                                  ? prev.filterTags.filter((t) => t !== tag)
                                  : [...prev.filterTags, tag],
                              }));
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Select by Group */}
              <Card
                className={cn(
                  "cursor-pointer transition-colors",
                  campaignData.audienceType === "group"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() =>
                  setCampaignData((prev) => ({
                    ...prev,
                    audienceType: "group",
                  }))
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Select by Group</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose contacts by their group
                      </p>
                    </div>
                    {campaignData.audienceType === "group" && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  {campaignData.audienceType === "group" && (
                    <div className="mt-4">
                      <Label className="text-sm">Select Group:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {allGroups.map((group) => (
                          <Badge
                            key={group}
                            variant={
                              campaignData.selectedGroup === group
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                              setCampaignData((prev) => ({
                                ...prev,
                                selectedGroup:
                                  prev.selectedGroup === group ? "" : group,
                              }))
                            }
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Select Individual Contacts */}
              <Card
                className={cn(
                  "cursor-pointer transition-colors",
                  campaignData.audienceType === "selected"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() =>
                  setCampaignData((prev) => ({
                    ...prev,
                    audienceType: "selected",
                  }))
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Select Individual Contacts
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Choose specific contacts
                      </p>
                    </div>
                    {campaignData.audienceType === "selected" && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Audience Preview */}
            {campaignData.audienceType !== "all" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Selected Audience ({getSelectedContacts().length} contacts)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-60 overflow-y-auto">
                    {getSelectedContacts()
                      .slice(0, 10)
                      .map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between py-2"
                        >
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {contact.phone}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            {contact.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {contact.group && (
                              <Badge variant="outline" className="text-xs">
                                {contact.group}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    {getSelectedContacts().length > 10 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        ... and {getSelectedContacts().length - 10} more
                        contacts
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        const previewMessages = generatePreviewMessages();
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Preview Messages</h3>
              <p className="text-sm text-muted-foreground">
                Review how your messages will look before sending
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Template:
                      </Label>
                      <p className="font-medium">{selectedTemplate?.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Audience:
                      </Label>
                      <p className="font-medium">
                        {getSelectedContacts().length} contacts
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Variables Mapped:
                      </Label>
                      <p className="font-medium">
                        {campaignData.variables.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Message Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previewMessages.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {item.contact.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.contact.phone}
                          </span>
                        </div>
                        <p className="text-sm bg-muted p-2 rounded">
                          {item.message}
                        </p>
                      </div>
                    ))}
                    {getSelectedContacts().length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Previewing first 5 of {getSelectedContacts().length}{" "}
                        messages
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Schedule & Send</h3>
              <p className="text-sm text-muted-foreground">
                Choose when to send your campaign
              </p>
            </div>
            <div className="space-y-4">
              <Card
                className={cn(
                  "cursor-pointer transition-colors",
                  campaignData.scheduleType === "now"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() =>
                  setCampaignData((prev) => ({ ...prev, scheduleType: "now" }))
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Send className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">Send Now</h4>
                        <p className="text-sm text-muted-foreground">
                          Send immediately
                        </p>
                      </div>
                    </div>
                    {campaignData.scheduleType === "now" && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card
                className={cn(
                  "cursor-pointer transition-colors",
                  campaignData.scheduleType === "scheduled"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() =>
                  setCampaignData((prev) => ({
                    ...prev,
                    scheduleType: "scheduled",
                  }))
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">Schedule for Later</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose date and time
                        </p>
                      </div>
                    </div>
                    {campaignData.scheduleType === "scheduled" && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  {campaignData.scheduleType === "scheduled" && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left mt-1"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {campaignData.scheduledDate
                                ? format(campaignData.scheduledDate, "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={campaignData.scheduledDate}
                              onSelect={(date) =>
                                setCampaignData((prev) => ({
                                  ...prev,
                                  scheduledDate: date,
                                }))
                              }
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={campaignData.scheduledTime}
                          onChange={(e) =>
                            setCampaignData((prev) => ({
                              ...prev,
                              scheduledTime: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Final Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Campaign Name:
                    </Label>
                    <p className="font-medium">{campaignData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Template:
                    </Label>
                    <p className="font-medium">{selectedTemplate?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Audience Size:
                    </Label>
                    <p className="font-medium">
                      {getSelectedContacts().length} contacts
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Schedule:
                    </Label>
                    <p className="font-medium">
                      {campaignData.scheduleType === "now"
                        ? "Send Now"
                        : `${
                            campaignData.scheduledDate
                              ? format(campaignData.scheduledDate, "PPP")
                              : "No date"
                          } at ${campaignData.scheduledTime}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center min-w-fit">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : currentStep === step.id - 1
                      ? "border-primary text-primary bg-primary/10"
                      : "bg-muted text-muted-foreground border-muted-foreground/30"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div
                  className={cn(
                    "mt-2 text-xs font-medium px-2 py-1 rounded-full",
                    currentStep >= step.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Step {step.id}
                </div>
                <div className="mt-1 text-center max-w-[120px]">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      currentStep >= step.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mt-[-40px] relative">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-all duration-300",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                  {currentStep === step.id + 1 && (
                    <div className="absolute top-0 left-0 h-0.5 bg-primary animate-pulse w-1/2" />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onClose : handlePrevious}
        >
          {currentStep === 1 ? (
            "Cancel"
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </>
          )}
        </Button>
        <Button
          onClick={currentStep === steps.length ? handleComplete : handleNext}
          className="bg-gradient-primary hover:shadow-glow"
          disabled={
            (currentStep === 1 &&
              (!campaignData.name || !campaignData.templateId)) ||
            (currentStep === 3 && getSelectedContacts().length === 0) ||
            (currentStep === 5 &&
              campaignData.scheduleType === "scheduled" &&
              !campaignData.scheduledDate)
          }
        >
          {currentStep === steps.length ? (
            "Launch Campaign"
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
