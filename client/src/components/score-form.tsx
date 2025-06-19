import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertScoreSchema, insertStudentSchema, Student } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const scoreFormSchema = insertScoreSchema.extend({
  studentId: z.number().min(1, "Student is required"),
  marks: z.string().min(1, "Marks are required").transform((val) => val.toString()),
  maxMarks: z.string().min(1, "Max marks are required").transform((val) => val.toString()),
  testDate: z.string().min(1, "Test date is required"),
});

const newStudentSchema = insertStudentSchema;

type ScoreFormData = z.infer<typeof scoreFormSchema>;
type NewStudentData = z.infer<typeof newStudentSchema>;

interface ScoreFormProps {
  onSuccess: () => void;
}

export function ScoreForm({ onSuccess }: ScoreFormProps) {
  const [newStudentDialogOpen, setNewStudentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const form = useForm<ScoreFormData>({
    resolver: zodResolver(scoreFormSchema),
    defaultValues: {
      studentId: 0,
      subject: "",
      marks: "",
      maxMarks: "",
      testDate: new Date().toISOString().split('T')[0],
    },
  });

  const newStudentForm = useForm<NewStudentData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const scoreMutation = useMutation({
    mutationFn: async (data: ScoreFormData) => {
      const scoreData = {
        ...data,
        testDate: new Date(data.testDate).toISOString(),
      };
      const res = await apiRequest("POST", "/api/scores", scoreData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Score added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add score",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const studentMutation = useMutation({
    mutationFn: async (data: NewStudentData) => {
      const res = await apiRequest("POST", "/api/students", data);
      return res.json();
    },
    onSuccess: (newStudent: Student) => {
      toast({
        title: "Success",
        description: "Student added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      form.setValue("studentId", newStudent.id);
      newStudentForm.reset();
      setNewStudentDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add student",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScoreFormData) => {
    scoreMutation.mutate(data);
  };

  const onAddStudent = (data: NewStudentData) => {
    studentMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <div className="flex space-x-2">
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-border flex-1">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={newStudentDialogOpen} onOpenChange={setNewStudentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-teal text-teal hover:bg-teal hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                      </DialogHeader>
                      <Form {...newStudentForm}>
                        <form onSubmit={newStudentForm.handleSubmit(onAddStudent)} className="space-y-4">
                          <FormField
                            control={newStudentForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Student name"
                                    className="bg-input border-border"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={newStudentForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="student@example.com"
                                    className="bg-input border-border"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="w-full gradient-teal text-white hover:opacity-90"
                            disabled={studentMutation.isPending}
                          >
                            {studentMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add Student
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks Obtained</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      className="bg-input border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Marks</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="100"
                      className="bg-input border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="testDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    className="bg-input border-border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full gradient-purple text-white hover:opacity-90"
            disabled={scoreMutation.isPending}
          >
            {scoreMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <TrendingUp className="mr-2 h-4 w-4" />
            Add Score
          </Button>
        </form>
      </Form>
    </div>
  );
}
