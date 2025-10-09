import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiteMode } from "@/contexts/LiteModeContext";
import { Smartphone, Zap, Globe } from "lucide-react";

export function LiteModeToggle() {
  const { isLiteMode, toggleLiteMode } = useLiteMode();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          <CardTitle>Lite Mode</CardTitle>
        </div>
        <CardDescription>
          Simplified interface optimized for rural areas with limited connectivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="lite-mode" className="flex flex-col space-y-1 cursor-pointer">
            <span className="font-medium">Enable Lite Mode</span>
            <span className="text-sm text-muted-foreground font-normal">
              {isLiteMode ? "Active" : "Disabled"}
            </span>
          </Label>
          <Switch
            id="lite-mode"
            checked={isLiteMode}
            onCheckedChange={toggleLiteMode}
          />
        </div>

        {/* Benefits */}
        <div className="space-y-3 pt-3 border-t">
          <p className="text-sm font-medium text-muted-foreground">Benefits:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Faster loading, uses less data</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Larger buttons, simpler navigation</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Globe className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Essential features only</span>
            </div>
          </div>
        </div>

        {isLiteMode && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Lite Mode is now active. You'll see a simplified interface optimized for essential farming tasks.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

