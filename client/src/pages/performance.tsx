import { Navbar } from "@/components/navbar";
import { PerformanceCharts } from "@/components/performance-charts";

export default function Performance() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Performance <span className="text-coral neon-glow">Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            Track student progress with detailed insights
          </p>
        </div>
        <PerformanceCharts />
      </div>
    </div>
  );
}
