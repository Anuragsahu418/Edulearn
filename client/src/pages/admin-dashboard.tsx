import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, Users, TrendingUp, FileText, Plus, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { UploadForm } from "@/components/upload-form";
import { ScoreForm } from "@/components/score-form";
import { MaterialsGrid } from "@/components/materials-grid";
import { PerformanceCharts } from "@/components/performance-charts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Material, Student, Score } from "@shared/schema";

export default function AdminDashboard() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);

  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: scores = [] } = useQuery<(Score & { studentName: string })[]>({
    queryKey: ["/api/scores"],
  });

  const recentMaterials = materials.slice(0, 5);
  const recentScores = scores.slice(0, 5);

  const totalSubjects = new Set(materials.map(m => m.subject)).size;
  const avgScore = scores.length > 0 
    ? scores.reduce((acc, score) => acc + (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100, 0) / scores.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin <span className="text-coral neon-glow">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your educational platform with ease
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Materials
              </CardTitle>
              <FileText className="h-4 w-4 text-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{materials.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {totalSubjects} subjects
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                Active learners
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Scores
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{scores.length}</div>
              <p className="text-xs text-muted-foreground">
                Assessment records
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-sky" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {avgScore.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Class performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
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

          <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-teal text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Score
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Student Score</DialogTitle>
              </DialogHeader>
              <ScoreForm onSuccess={() => setScoreDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Materials */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-coral" />
                    Recent Materials
                  </CardTitle>
                  <CardDescription>
                    Latest uploaded study materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentMaterials.length > 0 ? (
                      recentMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{material.title}</h4>
                            <p className="text-sm text-muted-foreground">{material.subject}</p>
                          </div>
                          <Badge variant="outline" className="border-coral text-coral">
                            PDF
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No materials uploaded yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Scores */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-teal" />
                    Recent Scores
                  </CardTitle>
                  <CardDescription>
                    Latest student performance records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentScores.length > 0 ? (
                      recentScores.map((score) => (
                        <div
                          key={score.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{score.studentName}</h4>
                            <p className="text-sm text-muted-foreground">{score.subject}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">
                              {score.marks}/{score.maxMarks}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No scores recorded yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsGrid />
          </TabsContent>

          <TabsContent value="scores">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">All Scores</CardTitle>
                <CardDescription>
                  Complete list of student performance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scores.length > 0 ? (
                    scores.map((score) => (
                      <div
                        key={score.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <h4 className="font-medium text-foreground">{score.studentName}</h4>
                            <p className="text-sm text-muted-foreground">{score.subject}</p>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-foreground">
                              {score.marks}/{score.maxMarks}
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100 >= 80
                                  ? "border-mint text-mint"
                                  : (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100 >= 60
                                  ? "border-yellow text-yellow"
                                  : "border-coral text-coral"
                              }
                            >
                              {((parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(score.testDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No scores recorded yet. Add student scores to see them here.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <PerformanceCharts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
