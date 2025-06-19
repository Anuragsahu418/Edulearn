import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Trash2, Calendar, User, FileText, Target, Upload, Download, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Score, Student, Material } from "@shared/schema";

interface ScoreEntry {
  id?: number;
  date: string;
  studentName: string;
  testName: string;
  marks: string;
  isNew?: boolean;
}

export default function AdminDashboard() {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [secretKey, setSecretKey] = useState("");
  const [uploadData, setUploadData] = useState({
    title: "",
    subject: "",
    description: "",
    file: null as File | null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logoutMutation } = useAuth();

  const { data: scores = [] } = useQuery<(Score & { studentName: string })[]>({
    queryKey: ["/api/scores"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  // Convert existing scores to entries format
  useEffect(() => {
    const scoreEntries: ScoreEntry[] = scores.map(score => ({
      id: score.id,
      date: new Date(score.testDate).toISOString().split('T')[0],
      studentName: score.studentName,
      testName: score.subject,
      marks: `${score.marks}/${score.maxMarks}`,
    }));
    setEntries(scoreEntries);
  }, [scores]);

  const saveEntryMutation = useMutation({
    mutationFn: async (entry: ScoreEntry) => {
      // Create student if doesn't exist
      let student = students.find(s => s.name === entry.studentName);
      if (!student) {
        const studentRes = await apiRequest("POST", "/api/students", { 
          name: entry.studentName 
        });
        student = await studentRes.json();
      }

      if (!student) {
        throw new Error("Failed to create or find student");
      }

      // Parse marks
      const marksParts = entry.marks.includes('/') ? entry.marks.split('/') : [entry.marks, "100"];
      const marks = parseFloat(marksParts[0].trim());
      const maxMarks = parseFloat(marksParts[1]?.trim() || "100");
      
      if (isNaN(marks) || isNaN(maxMarks)) {
        throw new Error("Invalid marks format. Use numbers like '85' or '85/100'");
      }
      
      const scoreData = {
        studentId: student.id,
        subject: entry.testName,
        marks: marks.toString(),
        maxMarks: maxMarks.toString(),
        testDate: new Date(entry.date).toISOString(),
      };

      const res = await apiRequest("POST", "/api/scores", scoreData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Score saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSecretKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await apiRequest("PUT", "/api/settings/student_secret_key", { value: key });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Secret key updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: typeof uploadData) => {
      if (!data.file) throw new Error("No file selected");
      
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      formData.append("subject", data.subject);
      formData.append("description", data.description);

      const res = await fetch("/api/materials", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "PDF uploaded successfully!",
      });
      setUploadData({ title: "", subject: "", description: "", file: null });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addNewRow = () => {
    const newEntry: ScoreEntry = {
      date: new Date().toISOString().split('T')[0],
      studentName: "",
      testName: "",
      marks: "",
      isNew: true,
    };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (index: number, field: keyof ScoreEntry, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const saveEntry = (index: number) => {
    const entry = entries[index];
    if (!entry.studentName || !entry.testName || !entry.marks) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    saveEntryMutation.mutate(entry);
  };

  const removeEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const updateSecretKey = () => {
    if (!secretKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a secret key",
        variant: "destructive",
      });
      return;
    }
    updateSecretKeyMutation.mutate(secretKey);
  };

  const handleUpload = () => {
    if (!uploadData.title || !uploadData.subject || !uploadData.file) {
      toast({
        title: "Error",
        description: "Please fill all fields and select a PDF file",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(uploadData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Error",
          description: "Please select a PDF file only",
          variant: "destructive",
        });
        return;
      }
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              <span className="text-coral neon-glow">EduLearn</span> Admin Panel
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                PDFs
              </CardTitle>
              <BookOpen className="h-4 w-4 text-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{materials.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Students
              </CardTitle>
              <User className="h-4 w-4 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{students.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Test Scores
              </CardTitle>
              <Target className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{entries.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Subjects
              </CardTitle>
              <Calendar className="h-4 w-4 text-sky" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {new Set([...materials.map(m => m.subject), ...entries.map(e => e.testName)]).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload PDFs</TabsTrigger>
            <TabsTrigger value="scores">Manage Scores</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* PDF Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-coral" />
                  Upload Study Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Mathematics Chapter 5"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-input border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={uploadData.subject}
                        onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
                        className="bg-input border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the material..."
                        value={uploadData.description}
                        onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-input border-border"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file">PDF File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="bg-input border-border"
                      />
                      {uploadData.file && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {uploadData.file.name}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleUpload}
                      className="w-full gradient-coral text-white hover:opacity-90"
                      disabled={uploadMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? "Uploading..." : "Upload PDF"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Materials List */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Uploaded Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No PDFs uploaded yet. Upload your first study material above.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{material.title}</h3>
                          <p className="text-sm text-muted-foreground">{material.subject}</p>
                          {material.description && (
                            <p className="text-xs text-muted-foreground mt-1">{material.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/files/${material.filename}`, '_blank')}
                          className="border-teal text-teal hover:bg-teal hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Scores Tab */}
          <TabsContent value="scores">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Student Test Scores</CardTitle>
                  <Button
                    onClick={addNewRow}
                    className="gradient-coral text-white hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Score
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-foreground font-semibold">Date</TableHead>
                        <TableHead className="text-foreground font-semibold">Student Name</TableHead>
                        <TableHead className="text-foreground font-semibold">Test/Subject</TableHead>
                        <TableHead className="text-foreground font-semibold">Marks</TableHead>
                        <TableHead className="text-foreground font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No test scores recorded yet. Click "Add Score" to add the first entry.
                          </TableCell>
                        </TableRow>
                      ) : (
                        entries.map((entry, index) => (
                          <TableRow key={index} className="hover:bg-muted/30">
                            <TableCell>
                              <Input
                                type="date"
                                value={entry.date}
                                onChange={(e) => updateEntry(index, 'date', e.target.value)}
                                className="bg-background border-border"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Student name"
                                value={entry.studentName}
                                onChange={(e) => updateEntry(index, 'studentName', e.target.value)}
                                className="bg-background border-border"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Test name or subject"
                                value={entry.testName}
                                onChange={(e) => updateEntry(index, 'testName', e.target.value)}
                                className="bg-background border-border"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="85/100 or just 85"
                                value={entry.marks}
                                onChange={(e) => updateEntry(index, 'marks', e.target.value)}
                                className="bg-background border-border"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {entry.isNew && (
                                  <Button
                                    size="sm"
                                    onClick={() => saveEntry(index)}
                                    className="gradient-mint text-white hover:opacity-90"
                                    disabled={saveEntryMutation.isPending}
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeEntry(index)}
                                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Student Portal Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="secretKey">Student Access Secret Key</Label>
                    <div className="flex gap-4 items-end mt-2">
                      <div className="flex-1">
                        <Input
                          id="secretKey"
                          placeholder="Enter new secret key for students"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          className="bg-input border-border"
                        />
                      </div>
                      <Button
                        onClick={updateSecretKey}
                        className="gradient-teal text-white hover:opacity-90"
                        disabled={updateSecretKeyMutation.isPending}
                      >
                        Update Key
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Students will use this key to access the student portal at /student
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
