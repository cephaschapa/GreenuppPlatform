import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')] bg-[length:20px_20px] opacity-5 pointer-events-none"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md mx-4 bg-black/80 border border-primary/30 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <AlertCircle className="h-16 w-16 text-primary animate-pulse-glow" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white font-orbitron mb-2">404</h1>
            <p className="text-xl text-gray-400 font-grotesk mb-6">System Error: Path Not Found</p>
            <div className="w-16 h-0.5 bg-primary/50 mx-auto mb-6"></div>
          </div>

          <p className="text-gray-400 font-mono text-sm text-center mb-8">
            This sector of the Greenupp ecosystem has not been initialized.
          </p>
          
          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/80 text-black font-medium">
                <span className="font-mono mr-2">→</span> Return to Home Base
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
