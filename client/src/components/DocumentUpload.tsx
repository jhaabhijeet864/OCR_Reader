import { useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUploadDocument, handleApiError } from "@/lib/api";

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

const DocumentUpload = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const { mutate: uploadDocument, isPending } = useUploadDocument();

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type === "application/pdf") {
        // Add the document to the UI immediately for better UX
        const newDoc: UploadedDocument = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
        };
        setDocuments((prev) => [...prev, newDoc]);
        
        // Upload to the server
        uploadDocument(
          { file },
          {
            onSuccess: (data) => {
              toast({
                title: "Document processed",
                description: `${file.name} has been uploaded and processed: ${data.chunkCount} chunks created.`,
              });
            },
            onError: (error) => {
              // Remove the document from the UI if upload fails
              setDocuments((prev) => prev.filter(doc => doc.id !== newDoc.id));
              toast({
                title: "Upload failed",
                description: handleApiError(error),
                variant: "destructive",
              });
            }
          }
        );
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF files only.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Card className="p-6 shadow-elegant">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Document Upload</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
          isDragOver
            ? "border-primary bg-gradient-secondary"
            : "border-border hover:border-primary"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {isPending ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-foreground font-medium mb-2">
              Processing document...
            </p>
            <p className="text-muted-foreground text-sm">
              This may take a moment depending on the file size
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              Drop your financial documents here
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              or click to browse files (PDF only)
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-input")?.click()}
              disabled={isPending}
            >
              Browse Files
            </Button>
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={isPending}
            />
          </>
        )}
      </div>

      {documents.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-foreground mb-3">Uploaded Documents</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default DocumentUpload;