import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PieChart, Calendar, Users, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState } from "react";
import { Score, Student } from "@shared/schema";

export function PerformanceCharts() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");

  const { data: scores = [], isLoading: scoresLoading } = useQuery<(Score & { studentName: string })[]>({
    queryKey: ["/api/scores"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  if (scoresLoading || studentsLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader>
              <div className="shimmer">
                <div className="h-4 bg-background rounded mb-2"></div>
                <div className="h-3 bg-background rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 shimmer">
                <div className="h-full bg-background rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filter data based on selections
  const filteredScores = scores.filter(score => {
    const matchesSubject = selectedSubject === "all" || score.subject === selectedSubject;
    if (!matchesSubject) return false;

    if (selectedTimeframe !== "all") {
      const scoreDate = new Date(score.testDate);
      const now = new Date();
      const timeframeDays = selectedTimeframe === "week" ? 7 : selectedTimeframe === "month" ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
      return scoreDate >= cutoffDate;
    }
    return true;
  });

  // Calculate statistics
  const subjects = Array.from(new Set(scores.map(s => s.subject)));
  const totalScores = filteredScores.length;
  const avgScore = filteredScores.length > 0 
    ? filteredScores.reduce((acc, score) => acc + (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100, 0) / filteredScores.length
    : 0;

  // Prepare data for different chart types
  
  // 1. Subject Performance Overview (Bar Chart)
  const subjectPerformance = subjects.map(subject => {
    const subjectScores = filteredScores.filter(s => s.subject === subject);
    const avg = subjectScores.length > 0 
      ? subjectScores.reduce((acc, score) => acc + (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100, 0) / subjectScores.length
      : 0;
    return {
      subject: subject.length > 10 ? subject.substring(0, 10) + "..." : subject,
      fullSubject: subject,
      average: Math.round(avg * 100) / 100,
      count: subjectScores.length,
    };
  });

  // 2. Performance Trends Over Time (Line Chart)
  const performanceTrends = filteredScores
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    .reduce((acc, score) => {
      const date = new Date(score.testDate).toLocaleDateString();
      const percentage = (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100;
      
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.scores.push(percentage);
        existing.average = existing.scores.reduce((sum, s) => sum + s, 0) / existing.scores.length;
      } else {
        acc.push({
          date,
          scores: [percentage],
          average: percentage,
        });
      }
      return acc;
    }, [] as { date: string; scores: number[]; average: number }[])
    .map(item => ({
      date: item.date,
      average: Math.round(item.average * 100) / 100,
      count: item.scores.length,
    }));

  // 3. Grade Distribution (Pie Chart)
  const gradeDistribution = filteredScores.reduce((acc, score) => {
    const percentage = (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100;
    let grade: string;
    if (percentage >= 90) grade = "A+ (90-100%)";
    else if (percentage >= 80) grade = "A (80-89%)";
    else if (percentage >= 70) grade = "B (70-79%)";
    else if (percentage >= 60) grade = "C (60-69%)";
    else if (percentage >= 50) grade = "D (50-59%)";
    else grade = "F (Below 50%)";

    const existing = acc.find(item => item.grade === grade);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ grade, count: 1 });
    }
    return acc;
  }, [] as { grade: string; count: number }[]);

  // 4. Student Performance (Top performers)
  const studentPerformance = students.map(student => {
    const studentScores = filteredScores.filter(s => s.studentId === student.id);
    const avg = studentScores.length > 0
      ? studentScores.reduce((acc, score) => acc + (parseFloat(score.marks) / parseFloat(score.maxMarks)) * 100, 0) / studentScores.length
      : 0;
    return {
      name: student.name.length > 15 ? student.name.substring(0, 15) + "..." : student.name,
      fullName: student.name,
      average: Math.round(avg * 100) / 100,
      count: studentScores.length,
    };
  }).filter(s => s.count > 0).sort((a, b) => b.average - a.average).slice(0, 10);

  // Colors for charts
  const chartColors = {
    coral: "hsl(358, 100%, 69%)",
    teal: "hsl(174, 60%, 63%)",
    sky: "hsl(198, 60%, 63%)",
    mint: "hsl(142, 37%, 67%)",
    purple: "hsl(271, 91%, 65%)",
    orange: "hsl(28, 100%, 63%)",
    yellow: "hsl(48, 100%, 67%)",
  };

  const gradeColors = [
    chartColors.mint,    // A+
    chartColors.teal,    // A
    chartColors.sky,     // B
    chartColors.yellow,  // C
    chartColors.orange,  // D
    chartColors.coral,   // F
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-48 bg-input border-border">
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
        
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-full sm:w-48 bg-input border-border">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Assessments
            </CardTitle>
            <Target className="h-4 w-4 text-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalScores}</div>
            <p className="text-xs text-muted-foreground">
              Recorded scores
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Average Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Active Students
            </CardTitle>
            <Users className="h-4 w-4 text-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(filteredScores.map(s => s.studentId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              With recorded scores
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Subjects Covered
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-sky" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(filteredScores.map(s => s.subject)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different subjects
            </p>
          </CardContent>
        </Card>
      </div>

      {totalScores === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Performance Data Available
            </h3>
            <p className="text-muted-foreground">
              {selectedSubject !== "all" || selectedTimeframe !== "all"
                ? "No scores found for the selected filters. Try adjusting your criteria."
                : "Add student scores to see performance analytics and visualizations."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Performance */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-coral" />
                Subject Performance
              </CardTitle>
              <CardDescription>
                Average scores by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 3.7%, 15.9%)" />
                    <XAxis 
                      dataKey="subject" 
                      stroke="hsl(240, 5%, 64.9%)" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(240, 5%, 64.9%)" 
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(240, 10%, 3.9%)",
                        border: "1px solid hsl(240, 3.7%, 15.9%)",
                        borderRadius: "8px",
                        color: "hsl(0, 0%, 98%)"
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value}%`,
                        `Average Score (${props.payload.count} tests)`
                      ]}
                      labelFormatter={(label: any, payload: any) => 
                        payload?.[0]?.payload?.fullSubject || label
                      }
                    />
                    <Bar dataKey="average" fill={chartColors.coral} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-teal" />
                Grade Distribution
              </CardTitle>
              <CardDescription>
                Performance grade breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ grade, count }) => `${grade}: ${count}`}
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={gradeColors[index % gradeColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(240, 10%, 3.9%)",
                        border: "1px solid hsl(240, 3.7%, 15.9%)",
                        borderRadius: "8px",
                        color: "hsl(0, 0%, 98%)"
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          {performanceTrends.length > 1 && (
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Average scores over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrends}>
                      <defs>
                        <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.purple} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColors.purple} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 3.7%, 15.9%)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(240, 5%, 64.9%)" 
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(240, 5%, 64.9%)" 
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(240, 10%, 3.9%)",
                          border: "1px solid hsl(240, 3.7%, 15.9%)",
                          borderRadius: "8px",
                          color: "hsl(0, 0%, 98%)"
                        }}
                        formatter={(value: any, name: any, props: any) => [
                          `${value}%`,
                          `Average Score (${props.payload.count} tests)`
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="average"
                        stroke={chartColors.purple}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAverage)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Students */}
          {studentPerformance.length > 0 && (
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Users className="w-5 h-5 mr-2 text-sky" />
                  Student Performance
                </CardTitle>
                <CardDescription>
                  Top performing students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentPerformance.slice(0, 8).map((student, index) => (
                    <div
                      key={student.fullName}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? "bg-yellow" : 
                          index === 1 ? "bg-mint" : 
                          index === 2 ? "bg-orange" : "bg-sky"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {student.count} assessment{student.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {student.average}%
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            student.average >= 90 ? "border-mint text-mint" :
                            student.average >= 80 ? "border-teal text-teal" :
                            student.average >= 70 ? "border-sky text-sky" :
                            student.average >= 60 ? "border-yellow text-yellow" :
                            "border-coral text-coral"
                          }
                        >
                          {student.average >= 90 ? "Excellent" :
                           student.average >= 80 ? "Good" :
                           student.average >= 70 ? "Average" :
                           student.average >= 60 ? "Below Average" :
                           "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
