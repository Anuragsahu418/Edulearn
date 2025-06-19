import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, LogOut, BookOpen, BarChart3, Home } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <GraduationCap className="w-8 h-8 text-coral" />
                <span className="text-xl font-bold text-foreground">
                  Edu<span className="text-coral">Learn</span>
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <Button
                  variant={isActive("/") || isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  className={isActive("/") || isActive("/admin") ? "gradient-coral text-white" : ""}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/materials">
                <Button
                  variant={isActive("/materials") ? "default" : "ghost"}
                  size="sm"
                  className={isActive("/materials") ? "gradient-teal text-white" : ""}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Materials
                </Button>
              </Link>
              <Link href="/performance">
                <Button
                  variant={isActive("/performance") ? "default" : "ghost"}
                  size="sm"
                  className={isActive("/performance") ? "gradient-purple text-white" : ""}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Welcome,</span>
                <span className="text-sm font-medium text-foreground">{user.username}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
