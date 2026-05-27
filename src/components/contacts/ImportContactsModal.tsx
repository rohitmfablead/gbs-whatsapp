import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import {
  uploadContactsCSV,
  fetchContacts,
} from "../../features/contacts/contactSlice";
import * as XLSX from "xlsx";

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (contacts: any[]) => void;
  availableGroups?: { id: string; name: string }[];
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  availableGroups = [],
}) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalCSV, setTotalCSV] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const uploadedFile = event.target.files?.[0];
  //   if (!uploadedFile) return;
  //   if (!uploadedFile.name.endsWith(".csv")) {
  //     toast.error("Please upload a CSV file");
  //     return;
  //   }
  //   setFile(uploadedFile);
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const text = e.target?.result as string;
  //     const rows = text
  //       .split("\n")
  //       .map((row) =>
  //         row.split(",").map((cell) => cell.trim().replace(/"/g, ""))
  //       );
  //     setCsvData(rows);
  //   };
  //   reader.readAsText(uploadedFile);
  // };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (
      !uploadedFile.name.endsWith(".csv") &&
      !uploadedFile.name.endsWith(".xlsx")
    ) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (uploadedFile.name.endsWith(".csv")) {
          const text = e.target?.result as string;
          const rows = text
            .split("\n")
            .map((row) =>
              row.split(",").map((cell) => cell.trim().replace(/"/g, ""))
            );
          setCsvData(rows);
        } else if (uploadedFile.name.endsWith(".xlsx")) {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          setCsvData(rows);
        }
      } catch (error) {
        toast.error("Failed to parse file");
        console.error(error);
      }
    };

    if (uploadedFile.name.endsWith(".xlsx")) {
      reader.readAsArrayBuffer(uploadedFile);
    } else {
      reader.readAsText(uploadedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("No CSV or Excel file selected");
      return;
    }
    setStep(2);
    setIsImporting(true);

    const CHUNK_SIZE = 100;
    let totalImported = 0;
    let totalFailed = 0;
    let allErrors: string[] = [];

    try {
      const token = localStorage.getItem("token");
      const fileChunks = csvData.length > 0 ? csvData : [];

      if (fileChunks.length === 0) {
        toast.error("No data found in file");
        setIsImporting(false);
        setStep(1);
        return;
      }

      const chunks = [];
      for (let i = 1; i < fileChunks.length; i += CHUNK_SIZE) {
        chunks.push(fileChunks.slice(i, i + CHUNK_SIZE));
      }

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const formData = new FormData();

        const csvContent = [
          fileChunks[0].join(","),
          ...chunk.map((row: any[]) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        formData.append("contacts", blob, "chunk.csv");

        if (selectedGroups.length > 0) {
          selectedGroups.forEach((group) => {
            formData.append("groupIds[]", group);
          });
        }

        const result = await dispatch(
          uploadContactsCSV({ token, formData })
        ).unwrap();

        const imported = result.data?.imported_count || 0;
        const failed = result.data?.errors?.length || 0;

        totalImported += imported;
        totalFailed += failed;
        allErrors = [...allErrors, ...(result.data?.errors || [])];

        const progress = Math.round(((chunkIndex + 1) / chunks.length) * 100);
        setImportProgress(progress);
      }

      setImportedCount(totalImported);
      setSkippedCount(totalFailed);
      setTotalCSV(totalImported + totalFailed);
      setErrors(allErrors);

      setStep(3);
      onImportComplete?.([]);
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err?.message || "Failed to import contacts");
      setStep(1);
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    // setStep(1);
    setFile(null);
    setImportProgress(0);
    setCsvData([]);
    setImportedCount(0);
    setSkippedCount(0);
    setTotalCSV(0);
    setErrors([]);
  };

  const handleClose = () => {
    const token = localStorage.getItem("token");
    dispatch(fetchContacts(token));
    resetModal();
    onClose();
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && (step === 1 || step === 3)) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Import contacts from a CSV or Excel file
          </DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-2 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <div className="space-y-2">
                <h3 className="font-medium">Upload CSV or Excel File</h3>
                <p className="text-sm text-muted-foreground">
                  Select a CSV or Excel file containing your contacts
                </p>
              </div>
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="mt-4"
              />
            </div>
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-sm font-medium">
                Select Groups (optional)
              </label>

              {/* Dropdown trigger */}
              <div
                className="border border-input bg-white rounded-md p-2 w-full cursor-pointer min-h-[2.5rem]"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedGroups.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedGroups.map((groupId) => {
                      const group = availableGroups.find(
                        (g) => g.id === groupId
                      );
                      return (
                        <div
                          key={groupId}
                          className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span>{group?.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGroups(
                                selectedGroups.filter((id) => id !== groupId)
                              );
                            }}
                            className="text-red-500 hover:text-red-700 font-sm ml-1"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    -- Select Groups --
                  </span>
                )}
              </div>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div className="absolute z-10 w-full max-h-60 overflow-y-auto border border-input bg-white rounded-md mt-1 shadow-lg">
                  {availableGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`px-3 py-1 cursor-pointer flex items-center justify-between hover:bg-gray-100 ${
                        selectedGroups.includes(group.id) ? "text-blue-500" : ""
                      }`}
                      onClick={() => {
                        if (selectedGroups.includes(group.id)) {
                          setSelectedGroups(
                            selectedGroups.filter((id) => id !== group.id)
                          );
                          setDropdownOpen(false);
                        } else {
                          setSelectedGroups([...selectedGroups, group.id]);
                          setDropdownOpen(false);
                        }
                      }}
                    >
                      <span className="text-sm">{group.name}</span>
                      {selectedGroups.includes(group.id) && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CSV Format Notes */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">File Format Requirements:</h4>

                  {/* Download Sample File Button */}
                  <Button
                    size="sm"
                    onClick={() => {
                      const csvContent =
                        "name,phone,groupName\n" +
                        "Rahul,+919173129113,VIP Customers\n" +
                        "Anita,+919812345678\n" +
                        "Suresh,+919765432189,New Leads\n" +
                        "Meena,+918765432190,VIP Customers\n" +
                        "Amit,+919998877665\n" +
                        "Priya,+919887766554,Inactive Users\n" +
                        "Karan,+917700112233,New Leads\n" +
                        "Neha,+919112233445,VIP Customers\n" +
                        "Vikram,+919223344556,Daily Hustlers\n" +
                        "Ritika,+918800112244,New Leads";

                      const blob = new Blob([csvContent], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const url = URL.createObjectURL(blob);

                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "sample.csv"; // simpler than setAttribute
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      URL.revokeObjectURL(url); // free memory
                    }}
                  >
                    Download Sample
                  </Button>
                </div>

                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• File must be in CSV (.csv) or Excel (.xlsx) format</li>
                  <li>
                    • Required columns: <strong>Name, Phone</strong>
                  </li>
                  <li>
                    • Optional column: <strong>GroupName</strong>
                  </li>
                  <li>
                    • Example header: <code>Name,Phone,GroupName</code>
                  </li>
                  <li>
                    • Example row (with GroupName):{" "}
                    <code>Rahul,+919173129113,VIP Customers</code>
                  </li>
                  <li>
                    • Example row (without GroupName):{" "}
                    <code>Rahul,+919173129113</code>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                className="bg-gradient-primary"
                disabled={!file}
              >
                Import Contacts
              </Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-medium">Importing Contacts</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we import your contacts...
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={importProgress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              {errors.length === 0 ? (
                <CheckCircle className="w-12 h-12 text-success" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-warning" />
              )}
              <h3 className="font-semibold text-lg">Import Complete</h3>
              <p className="text-sm text-muted-foreground">
                Total rows in CSV: {totalCSV}
              </p>
              <p className="text-sm text-success">Imported: {importedCount}</p>
              {errors.length > 0 && (
                <p className="text-sm text-destructive">
                  Failed: {errors.length}
                </p>
              )}
            </div>

            {errors.length > 0 && (
              <div className="w-full">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-medium text-destructive">
                      Import Errors
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {errors.map((error, index) => (
                        <p
                          key={index}
                          className="text-sm text-muted-foreground border-b border-border pb-1"
                        >
                          {error}{" "}
                          {/* This will show exact messages like "Row 2: Contact with phone 9173129113 already exists" */}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose} className="bg-gradient-primary">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
