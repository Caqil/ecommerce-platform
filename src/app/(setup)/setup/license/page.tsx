"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { InstallationProgress } from "@/components/setup/installation-progress";

export default function LicenseVerificationPage() {
  const router = useRouter();
  const [purchaseCode, setPurchaseCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyLicense = async () => {
    if (!purchaseCode.trim()) {
      setError("Please enter your purchase code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/setup/verify-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purchaseCode: purchaseCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        // Store verification in sessionStorage for next steps
        sessionStorage.setItem("license_verified", "true");
        sessionStorage.setItem("purchase_code", purchaseCode.trim());
      } else {
        setError(data.message || "License verification failed");
      }
    } catch (error) {
      setError(
        "Failed to verify license. Please check your connection and try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    router.push("/setup/database");
  };

  const handleBack = () => {
    router.push("/setup");
  };

  return (
    <div className="space-y-8">
      <InstallationProgress currentStep={2} totalSteps={6} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Shield className="h-6 w-6" />
            <span>License Verification</span>
          </CardTitle>
          <CardDescription>
            Please enter your Envato purchase code to verify your license and
            continue with the installation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseCode">Purchase Code</Label>
              <Input
                id="purchaseCode"
                placeholder="Enter your Envato purchase code"
                value={purchaseCode}
                onChange={(e) => setPurchaseCode(e.target.value)}
                disabled={isVerifying || isVerified}
                className="font-mono"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can find your purchase code in your Envato account under
                Downloads.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isVerified && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  License verified successfully! You can now proceed with the
                  installation.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How to find your purchase code:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>Log in to your Envato account</li>
                <li>Go to Downloads section</li>
                <li>Find eCommerce Platform Pro</li>
                <li>Click License certificate & purchase code</li>
                <li>
                  Copy the purchase code (format:
                  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
                </li>
              </ol>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="space-x-3">
              {!isVerified && (
                <Button
                  onClick={handleVerifyLicense}
                  disabled={isVerifying || !purchaseCode.trim()}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify License"
                  )}
                </Button>
              )}

              {isVerified && (
                <Button onClick={handleContinue}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
