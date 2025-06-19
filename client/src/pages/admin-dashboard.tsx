import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save, Trash2, Calendar, User, FileText, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Score, Student } from "@shared/schema";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logoutMutation } = useAuth();

  const { data: scores = [] } = useQuery<(Score & { studentName: string })[]>({
    queryKey: ["/api/scores"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
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
                Total Entries
              </CardTitle>
              <FileText className="h-4 w-4 text-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{entries.length}</div>
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
                Tests
              </CardTitle>
              <Target className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {new Set(entries.map(e => e.testName)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Latest Entry
              </CardTitle>
              <Calendar className="h-4 w-4 text-sky" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-foreground">
                {entries.length > 0 ? new Date(Math.max(...entries.map(e => new Date(e.date).getTime()))).toLocaleDateString() : "No entries"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secret Key Management */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-card-foreground">Student Portal Secret Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
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
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground">Student Scores Management</CardTitle>
              <Button
                onClick={addNewRow}
                className="gradient-coral text-white hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
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
                    <TableHead className="text-foreground font-semibold">Test Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Marks</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No entries yet. Click "Add Entry" to get started.
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
                            placeholder="Test/Subject name"
                            value={entry.testName}
                            onChange={(e) => updateEntry(index, 'testName', e.target.value)}
                            className="bg-background border-border"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="20/25 or 85"
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
      </div>
    </div>
  );
}
