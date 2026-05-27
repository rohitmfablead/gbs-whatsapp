import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ContactSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
}

export const ContactSelectionModal: React.FC<ContactSelectionModalProps> = ({
  isOpen,
  onOpenChange,
  onSelect,
}) => {
  const [selectedDetail, setSelectedDetail] = React.useState<"name" | "email" | "phone">("name");

  const handleSelect = () => {
    let value = "";
    switch (selectedDetail) {
      case "name":
        value = "contact::name";
        break;
      case "email":
        value = "contact::email";
        break;
      case "phone":
        value = "contact::phone";
        break;
    }
    onSelect(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Contact Detail</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Label>Select Detail to Insert:</Label>
          <RadioGroup
            value={selectedDetail}
            onValueChange={(value: "name" | "email" | "phone") => setSelectedDetail(value)}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="name" id="name" />
              <Label htmlFor="name">Name</Label>
            </div>
            {/* <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email">Email</Label>
            </div> */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phone" id="phone" />
              <Label htmlFor="phone">Phone</Label>
            </div>
          </RadioGroup>
        </div>
        <Button
          onClick={handleSelect}
          className="w-full mt-4"
        >
          Insert Selected Detail
        </Button>
      </DialogContent>
    </Dialog>
  );
};
