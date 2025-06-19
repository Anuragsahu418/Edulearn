import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Trash2, Search, Filter, Upload, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadForm } from "./upload-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Material } from "@shared/schema";

export function MaterialsGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/materials/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const subjects = Array.from(new Set(materials.map(m => m.subject)));
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "all" || material.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-48 bg-input border-border">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-coral text-white hover:opacity-90">
              <Upload className="w-4 h-4 mr-2" />
              Upload Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Study Material</DialogTitle>
            </DialogHeader>
            <UploadForm onSuccess={() => setUploadDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardHeader>
                <div className="shimmer">
                  <div className="h-4 bg-background rounded mb-2"></div>
                  <div className="h-3 bg-background rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="shimmer">
                  <div className="h-3 bg-background rounded mb-2"></div>
                  <div className="h-3 bg-background rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="border-border bg-card hover:bg-card/80 transition-colors group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-card-foreground text-lg flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-coral" />
                      {material.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {material.description || "No description available"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-teal text-teal">
                      {material.subject}
                    </Badge>
                    <Badge variant="outline" className="border-sky text-sky">
                      PDF
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Uploaded on {new Date(material.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-mint text-mint hover:bg-mint hover:text-white"
                      onClick={() => {
                        window.open(`/api/files/${material.filename}`, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(material.id, material.title)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || selectedSubject !== "all" 
                ? "No materials found"
                : "No materials uploaded yet"
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedSubject !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Upload your first study material to get started."
              }
            </p>
            {(!searchTerm && selectedSubject === "all") && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-coral text-white hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload First Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Study Material</DialogTitle>
                  </DialogHeader>
                  <UploadForm onSuccess={() => setUploadDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
