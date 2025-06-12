import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

interface InstallationProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  "System Check",
  "License Verification",
  "Database Setup",
  "Admin Account",
  "Store Configuration",
  "Installation Complete",
];

export function InstallationProgress({
  currentStep,
  totalSteps,
}: InstallationProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                isCompleted
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : isCurrent
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-3 w-3 flex-shrink-0" />
              ) : (
                <Circle className="h-3 w-3 flex-shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
