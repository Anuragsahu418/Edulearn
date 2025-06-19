import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, GraduationCap, BookOpen, TrendingUp, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = insertUserSchema.extend({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect after hooks are called
  if (user) {
    setTimeout(() => navigate("/"), 0);
    return null;
  }

  const onLogin = async (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const onRegister = async (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to <span className="text-coral neon-glow">EduLearn</span>
            </h1>
            <p className="text-muted-foreground">
              Your educational platform for excellence
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Login to Admin Panel</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the admin dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your username"
                                className="bg-input border-border text-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                className="bg-input border-border text-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full gradient-coral text-white hover:opacity-90"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Create Admin Account</CardTitle>
                  <CardDescription>
                    Register a new admin account to manage the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Choose a username"
                                className="bg-input border-border text-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Create a strong password"
                                className="bg-input border-border text-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full gradient-teal text-white hover:opacity-90"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Looking for student access?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/student")}
              className="border-teal text-teal hover:bg-teal hover:text-white"
            >
              Student Portal
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-coral rounded-full opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 bg-teal rounded-full opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple rounded-full opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-sky rounded-full opacity-20 animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-center">
          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">
                Transform Education with{" "}
                <span className="text-coral neon-glow">Technology</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Empowering students and educators with cutting-edge tools for
                learning, tracking, and achievement.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-coral rounded-full mx-auto">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Study Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Access comprehensive PDF resources
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-teal rounded-full mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Performance Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor progress with colorful analytics
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-purple rounded-full mx-auto">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Student Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Designed for educational excellence
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-sky rounded-full mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Easy Management</h3>
                <p className="text-sm text-muted-foreground">
                  Streamlined admin and student access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
