import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";

interface SetupLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export default function SetupLayout({
  children,
  currentStep,
  totalSteps,
  stepTitle,
}: SetupLayoutProps) {
  const progressValue = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8 space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                eCommerce Platform Pro Setup
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{stepTitle}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progressValue)}% Complete</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
