"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { InstallationProgress } from "@/components/setup/installation-progress";

interface RequirementCheck {
  name: string;
  status: "checking" | "passed" | "failed";
  message?: string;
}

export default function SetupWelcomePage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<RequirementCheck[]>([
    { name: "Node.js Version", status: "checking" },
    { name: "Environment File", status: "checking" },
    { name: "Write Permissions", status: "checking" },
    { name: "Required Dependencies", status: "checking" },
  ]);
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    checkRequirements();
  }, []);

  const checkRequirements = async () => {
    const checks = [...requirements];

    // Simulate requirement checks
    for (let i = 0; i < checks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      checks[i].status = Math.random() > 0.1 ? "passed" : "failed";

      if (checks[i].status === "failed") {
        checks[
          i
        ].message = `${checks[i].name} check failed. Please resolve this issue.`;
      }

      setRequirements([...checks]);
    }

    const passed = checks.every((check) => check.status === "passed");
    setAllPassed(passed);
  };

  const handleContinue = () => {
    router.push("/setup/license");
  };

  const getStatusIcon = (status: RequirementCheck["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <InstallationProgress currentStep={1} totalSteps={6} />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome to eCommerce Platform Pro
          </CardTitle>
          <CardDescription>
            This setup wizard will guide you through the installation process.
            Well start by checking your system requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Requirements</h3>

            <div className="space-y-3">
              {requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  {getStatusIcon(requirement.status)}
                  <div className="flex-1">
                    <div className="font-medium">{requirement.name}</div>
                    {requirement.message && (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {requirement.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allPassed && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="text-green-800 dark:text-green-200 font-medium">
                  All requirements passed! You can proceed with the
                  installation.
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <div></div>
            <Button
              onClick={handleContinue}
              disabled={!allPassed}
              className="flex items-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
