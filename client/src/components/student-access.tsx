import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Key, BookOpen, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface StudentAccessProps {
  onAuthenticated: () => void;
}

export function StudentAccess({ onAuthenticated }: StudentAccessProps) {
  const [secretKey, setSecretKey] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const validateMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await apiRequest("POST", "/api/student/validate", { secretKey: key });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Access Granted",
        description: "Welcome to the student portal!",
      });
      onAuthenticated();
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid secret key. Please check and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter the secret key",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate(secretKey);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Access form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <GraduationCap className="w-16 h-16 text-coral mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Student <span className="text-coral neon-glow">Portal</span>
            </h1>
            <p className="text-muted-foreground">
              Enter your secret key to access study materials
            </p>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Key className="w-5 h-5 mr-2 text-coral" />
                Access Required
              </CardTitle>
              <CardDescription>
                Enter the secret key provided by your instructor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter your secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="bg-input border-border text-foreground"
                    disabled={validateMutation.isPending}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-coral text-white hover:opacity-90"
                  disabled={validateMutation.isPending}
                >
                  {validateMutation.isPending ? "Validating..." : "Access Portal"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Are you an administrator?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-teal text-teal hover:bg-teal hover:text-white"
            >
              Admin Login
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
                Your Learning{" "}
                <span className="text-coral neon-glow">Journey</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Access comprehensive study materials, track your progress, and 
                excel in your educational journey.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-card/50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-coral rounded-full">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Study Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    Download PDFs and access course content
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-card/50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-teal rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your academic performance
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-card/50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-purple rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Easy Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Simple and secure portal access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
