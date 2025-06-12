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
import {
  ArrowRight,
  ArrowLeft,
  Database,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { InstallationProgress } from "@/components/setup/installation-progress";

export default function DatabaseConfigurationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    mongoUri: "mongodb://localhost:27017/ecommerce-platform-pro",
    testConnection: false,
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [isCreatingDatabase, setIsCreatingDatabase] = useState(false);

  useEffect(() => {
    // Check if license was verified
    const licenseVerified = sessionStorage.getItem("license_verified");
    if (!licenseVerified) {
      router.push("/setup/license");
    }
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setConnectionStatus("idle");
    setError("");
  };

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("testing");
    setError("");

    try {
      const response = await fetch("/api/setup/check-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mongoUri: formData.mongoUri }),
      });

      const data = await response.json();

      if (response.ok) {
        setConnectionStatus("success");
        setFormData((prev) => ({ ...prev, testConnection: true }));
      } else {
        setConnectionStatus("error");
        setError(data.message || "Database connection failed");
      }
    } catch (error) {
      setConnectionStatus("error");
      setError("Failed to test database connection");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const createDatabase = async () => {
    setIsCreatingDatabase(true);
    setError("");

    try {
      const response = await fetch("/api/setup/create-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mongoUri: formData.mongoUri,
          purchaseCode: sessionStorage.getItem("purchase_code"),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store database config for next steps
        sessionStorage.setItem("database_configured", "true");
        sessionStorage.setItem("mongo_uri", formData.mongoUri);
        router.push("/setup/admin");
      } else {
        setError(data.message || "Database creation failed");
      }
    } catch (error) {
      setError("Failed to create database");
    } finally {
      setIsCreatingDatabase(false);
    }
  };

  const handleBack = () => {
    router.push("/setup/license");
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <InstallationProgress currentStep={3} totalSteps={6} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Database className="h-6 w-6" />
            <span>Database Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your MongoDB database connection. Make sure MongoDB is
            running and accessible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mongoUri">MongoDB Connection URI</Label>
              <div className="flex space-x-2">
                <Input
                  id="mongoUri"
                  placeholder="mongodb://localhost:27017/ecommerce-platform-pro"
                  value={formData.mongoUri}
                  onChange={(e) =>
                    handleInputChange("mongoUri", e.target.value)
                  }
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  onClick={testDatabaseConnection}
                  disabled={isTestingConnection || !formData.mongoUri}
                  className="flex items-center space-x-2 shrink-0"
                >
                  {getConnectionStatusIcon()}
                  <span>Test</span>
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Format: mongodb://[username:password@]host[:port]/database_name
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {connectionStatus === "success" && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Database connection successful! You can now create the
                  database.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Database Setup Information:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <li>
                  The system will create all necessary collections and indexes
                </li>
                <li>Initial data and settings will be populated</li>
                <li>Make sure MongoDB service is running before proceeding</li>
                <li>The database user should have read/write permissions</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="space-x-3">
              <Button
                onClick={createDatabase}
                disabled={connectionStatus !== "success" || isCreatingDatabase}
                className="flex items-center space-x-2"
              >
                {isCreatingDatabase ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Database...</span>
                  </>
                ) : (
                  <>
                    <span>Create Database & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
