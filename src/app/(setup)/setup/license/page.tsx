// src/app/(setup)/setup/license/page.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Clock,
  User,
  Calendar,
  Globe,
} from "lucide-react";
import { InstallationProgress } from "@/components/setup/installation-progress";

interface LicenseData {
  purchaseCode: string;
  itemName?: string;
  buyer?: string;
  supportedUntil?: string;
  verifiedAt?: string;
  license?: string;
}

export default function LicenseVerificationPage() {
  const router = useRouter();
  const [purchaseCode, setPurchaseCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [verificationStep, setVerificationStep] = useState<
    "input" | "verifying" | "success" | "error"
  >("input");

  useEffect(() => {
    // Check if previous steps were completed
    const systemCheck = sessionStorage.getItem("system_check_completed");
    if (!systemCheck) {
      router.push("/setup");
    }
  }, [router]);

  const formatPurchaseCode = (value: string) => {
    // Remove any non-alphanumeric characters except hyphens
    const cleaned = value.replace(/[^a-fA-F0-9-]/g, "");

    // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const parts = cleaned.replace(/-/g, "");
    if (parts.length <= 8) return parts;
    if (parts.length <= 12) return `${parts.slice(0, 8)}-${parts.slice(8)}`;
    if (parts.length <= 16)
      return `${parts.slice(0, 8)}-${parts.slice(8, 12)}-${parts.slice(12)}`;
    if (parts.length <= 20)
      return `${parts.slice(0, 8)}-${parts.slice(8, 12)}-${parts.slice(
        12,
        16
      )}-${parts.slice(16)}`;

    return `${parts.slice(0, 8)}-${parts.slice(8, 12)}-${parts.slice(
      12,
      16
    )}-${parts.slice(16, 20)}-${parts.slice(20, 32)}`;
  };

  const handleInputChange = (value: string) => {
    const formatted = formatPurchaseCode(value);
    setPurchaseCode(formatted);
    setError("");
    setVerificationStep("input");
  };

  const validatePurchaseCodeFormat = (code: string) => {
    const envateCodeRegex =
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    return envateCodeRegex.test(code);
  };

  const handleVerifyLicense = async () => {
    if (!purchaseCode.trim()) {
      setError("Please enter your purchase code");
      return;
    }

    if (!validatePurchaseCodeFormat(purchaseCode)) {
      setError(
        "Invalid purchase code format. Please check your code and try again."
      );
      return;
    }

    setIsVerifying(true);
    setVerificationStep("verifying");
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
        setLicenseData(data.license);
        setVerificationStep("success");

        // Store verification in sessionStorage for next steps
        sessionStorage.setItem("license_verified", "true");
        sessionStorage.setItem("purchase_code", purchaseCode.trim());
        sessionStorage.setItem("license_data", JSON.stringify(data.license));
      } else {
        setVerificationStep("error");
        setError(data.message || "License verification failed");
      }
    } catch (error) {
      setVerificationStep("error");
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

  const handleRetry = () => {
    setVerificationStep("input");
    setError("");
    setIsVerifying(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isCodeFormatValid = validatePurchaseCodeFormat(purchaseCode);

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
          {verificationStep === "input" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseCode">Purchase Code</Label>
                <div className="relative">
                  <Input
                    id="purchaseCode"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={purchaseCode}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={`font-mono ${
                      purchaseCode && !isCodeFormatValid ? "border-red-500" : ""
                    }`}
                    maxLength={36}
                  />
                  {purchaseCode && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isCodeFormatValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You can find your purchase code in your Envato account under
                  Downloads.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  How to find your purchase code:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>Log in to your Envato account</li>
                  <li>Go to Downloads section</li>
                  <li>Find eCommerce Platform Pro</li>
                  <li>Click License certificate & purchase code</li>
                  <li>Copy the purchase code</li>
                </ol>
              </div>
            </div>
          )}

          {verificationStep === "verifying" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Verifying License
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Checking your purchase code with Envato...
                  <br />
                  This may take a few moments.
                </p>
              </div>
            </div>
          )}

          {verificationStep === "success" && licenseData && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  License verified successfully! Your purchase is valid.
                </AlertDescription>
              </Alert>

              <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-lg mb-3">
                  License Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Product:
                    </span>
                    <span className="font-medium">
                      {licenseData.itemName || "eCommerce Platform Pro"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Licensed to:
                    </span>
                    <span className="font-medium">
                      {licenseData.buyer || "Verified User"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      License Type:
                    </span>
                    <Badge
                      variant={
                        licenseData.license === "extended"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {licenseData.license === "extended"
                        ? "Extended"
                        : "Regular"}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Support Until:
                    </span>
                    <span className="font-medium">
                      {formatDate(licenseData.supportedUntil)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Verified:
                    </span>
                    <span className="text-sm">
                      {formatDate(licenseData.verifiedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {verificationStep === "error" && error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Common Issues & Solutions:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                  <li>Double-check your purchase code format</li>
                  <li>
                    Ensure you are using the code for eCommerce Platform Pro
                  </li>
                  <li>
                    Check if the code has been used on another installation
                  </li>
                  <li>Verify your internet connection is stable</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="space-x-3">
              {verificationStep === "input" && (
                <Button
                  onClick={handleVerifyLicense}
                  disabled={isVerifying || !isCodeFormatValid}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify License
                    </>
                  )}
                </Button>
              )}

              {verificationStep === "error" && (
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
              )}

              {verificationStep === "success" && (
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
