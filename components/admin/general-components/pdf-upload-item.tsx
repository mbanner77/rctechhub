import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast"

export interface ContentItem {
  id: string;
  title: string;
  category: "Online-Kurs" | "Workshop" | "Webinar"; // Fixed categories
  duration: string; // e.g. "2 hours" or "1 day"
  price: number;
  hours?: number;
  days?: number;
  unitId?: string; // ID of the associated pathfinder unit
  pdfDocument?: {
    filename: string;
    deleted: boolean;
    fileUrl: string;
    uploadDate?: string;
  };
}

type PdfUploadFieldProps = {
  value?: ContentItem;
  onChange: (fileInfo?: { filename: string; deleted: boolean, fileUrl: string; uploadDate?: string }) => void;
  label?: string;
  model?: any;
  uploadApiPath?: string; // e.g. "/api/upload-pdf"
  disabled?: boolean;
};

export const PdfUploadField: React.FC<PdfUploadFieldProps> = ({
  value,
  onChange,
  label = "PDF Dokument",
  model,
  uploadApiPath,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({
        title: "Fehler!",
        description: "Bitte laden Sie nur PDF-Dateien hoch.",
      })
      return;
    }

    if (uploadApiPath) {
      // Upload to server
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(uploadApiPath, { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        console.log("DATA URL:" + data.url)
        onChange({
          filename: data.filename || file.name,
          deleted: false,
          fileUrl: data.fileUrl,
          uploadDate: new Date().toISOString(),
        });
      } else {
        toast({
          title: "Fehler",
          description: `Leider ist beim Hochladen ein Fehler aufgetreten`,
        })
      }
    } else {
      // Local blob URL fallback
      const fileUrl = URL.createObjectURL(file);
      onChange({
        filename: file.name,
        deleted: false,
        fileUrl,
        uploadDate: new Date().toISOString(),
      });
    }
  };

  const handleRemoveFile = async () => {
    //if (uploadApiPath) {
    //const res: any = await fetch(uploadApiPath, { method: "DELETE" })
    //if (res.ok) {

    console.dir(model);

    const fileUrl = value?.pdfDocument?.fileUrl;
    if (fileUrl && fileUrl.startsWith('blob:')) {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(fileUrl);
      // Using model call by reference to set deletion flag 
    }

    // Remove the PDF document reference
    // fileInfo = { item.id, "pdfDocument", undefined } => undefined
    onChange({
      filename: value?.pdfDocument?.filename as string,
      deleted: true,
      fileUrl: value?.pdfDocument?.fileUrl as string,
      uploadDate: new Date().toISOString(),
    });

    toast({
      title: "Löschvorgang gemerkt!",
      description: "Diese Datei wurde zum Löschen VORGEMERKT. Bitte bestätigen Sie mit Klick auf 'Speichern'!"
    })
    //}
    //}
  };

  return (
    <div className="grid gap-2">
      <label className="font-medium">{label}</label>
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleUploadClick} variant="outline" type="button" disabled={disabled}>
          <Upload size={16} /> PDF hochladen
        </Button>
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          accept=".pdf"
          className="hidden"
          disabled={disabled}
        />
        { value?.pdfDocument && !value?.pdfDocument?.deleted && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md flex-grow">
            <FileText size={16} className="text-blue-500 shrink-0" />
            <div className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
              <span> Document  [ <a href={value?.pdfDocument?.fileUrl}>Preview</a> ]</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="ml-auto p-1 rounded-full hover:bg-gray-200 transition-colors"
              type="button"
              disabled={ false }
            >
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>
      {!value?.pdfDocument?.deleted && value?.pdfDocument?.uploadDate && (
        <p className="text-xs text-gray-500">
          Hochgeladen: {new Date(value.pdfDocument?.uploadDate).toLocaleString("de-DE")}
        </p>
      )}
    </div>
  );
};