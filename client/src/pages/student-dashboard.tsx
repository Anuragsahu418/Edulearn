import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Search, Filter, GraduationCap, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentAccess } from "@/components/student-access";
import { Material, Score } from "@shared/schema";

export default function StudentDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const { data: materials = [], isLoading: materialsLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
    enabled: isAuthenticated,
  });

  const { data: scores = [], isLoading: scoresLoading } = useQuery<(Score & { studentName: string })[]>({
    queryKey: ["/api/scores"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <StudentAccess onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const subjects = Array.from(new Set(materials.map(m => m.subject)));
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "all" || material.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const totalMaterials = materials.length;
  const totalSubjects = subjects.length;
  const recentScores = scores.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Student <span className="text-coral neon-glow">Portal</span>
              </h1>
              <p className="text-muted-foreground">
                Access your study materials and track your progress
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-mint/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-mint rounded-full"></div>
                <span className="text-sm text-mint font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Available Materials
              </CardTitle>
              <BookOpen className="h-4 w-4 text-coral" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalMaterials}</div>
              <p className="text-xs text-muted-foreground">
                Study resources
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Subjects
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalSubjects}</div>
              <p className="text-xs text-muted-foreground">
                Different courses
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Recent Scores
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{recentScores.length}</div>
              <p className="text-xs text-muted-foreground">
                Latest results
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-coral" />
                  Study Materials
                </CardTitle>
                <CardDescription>
                  Download and access your course materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

                {/* Materials Grid */}
                <div className="space-y-4">
                  {materialsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-muted rounded-lg shimmer">
                          <div className="h-4 bg-background rounded mb-2"></div>
                          <div className="h-3 bg-background rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredMaterials.length > 0 ? (
                    filteredMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">
                              {material.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {material.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="border-coral text-coral">
                                {material.subject}
                              </Badge>
                              <Badge variant="outline" className="border-sky text-sky">
                                PDF
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-teal text-teal hover:bg-teal hover:text-white"
                            onClick={() => {
                              window.open(`/api/files/${material.filename}`, '_blank');
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm || selectedSubject !== "all" 
                          ? "No materials found matching your search criteria."
                          : "No study materials available yet."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Performance */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple" />
                  Recent Performance
                </CardTitle>
                <CardDescription>
                  Your latest test scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scoresLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg shimmer">
                          <div className="h-3 bg-background rounded mb-2"></div>
                          <div className="h-2 bg-background rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentScores.length > 0 ? (
                    recentScores.map((score) => (
                      <div
                        key={score.id}
                        className="p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm">
                              {score.subject}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(score.testDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-foreground">
                              {score.marks}/{score.maxMarks}
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100 >= 80
                                  ? "border-mint text-mint text-xs"
                                  : (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100 >= 60
                                  ? "border-yellow text-yellow text-xs"
                                  : "border-coral text-coral text-xs"
                              }
                            >
                              {((parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No scores available yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subjects Overview */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-mint" />
                  Subjects
                </CardTitle>
                <CardDescription>
                  Available course subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => {
                      const subjectMaterials = materials.filter(m => m.subject === subject).length;
                      return (
                        <div
                          key={subject}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {subject}
                          </span>
                          <Badge variant="outline" className="border-sky text-sky text-xs">
                            {subjectMaterials} materials
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No subjects available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
