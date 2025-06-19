import { Navbar } from "@/components/navbar";
import { MaterialsGrid } from "@/components/materials-grid";

export default function Materials() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Study <span className="text-coral neon-glow">Materials</span>
          </h1>
          <p className="text-muted-foreground">
            Manage and organize your educational resources
          </p>
        </div>
        <MaterialsGrid />
      </div>
    </div>
  );
}
