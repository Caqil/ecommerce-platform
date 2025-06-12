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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  ArrowLeft,
  Store,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { InstallationProgress } from "@/components/setup/installation-progress";

export default function StoreConfigurationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    storeUrl: "",
    currency: "USD",
    timezone: "America/New_York",
    country: "US",
    language: "en",
  });
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if previous steps were completed
    const adminCreated = sessionStorage.getItem("admin_created");

    if (!adminCreated) {
      router.push("/setup/admin");
    }

    // Pre-populate with sensible defaults
    setFormData((prev) => ({
      ...prev,
      storeUrl: window.location.origin,
    }));
  }, [router]);

  const currencies = [
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "JPY", label: "Japanese Yen (¥)" },
    { value: "CAD", label: "Canadian Dollar (C$)" },
    { value: "AUD", label: "Australian Dollar (A$)" },
    { value: "INR", label: "Indian Rupee (₹)" },
  ];

  const countries = [
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "IN", label: "India" },
    { value: "JP", label: "Japan" },
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }

    if (!formData.storeUrl.trim()) {
      newErrors.storeUrl = "Store URL is required";
    } else {
      try {
        new URL(formData.storeUrl);
      } catch {
        newErrors.storeUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const configureStore = async () => {
    if (!validateForm()) return;

    setIsConfiguring(true);

    try {
      const response = await fetch("/api/setup/configure-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          purchaseCode: sessionStorage.getItem("purchase_code"),
          adminEmail: sessionStorage.getItem("admin_email"),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store configuration success
        sessionStorage.setItem("store_configured", "true");
        router.push("/setup/complete");
      } else {
        setErrors({ general: data.message || "Failed to configure store" });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrors({ general: "Failed to configure store. Please try again." });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleBack = () => {
    router.push("/setup/admin");
  };

  return (
    <div className="space-y-8">
      <InstallationProgress currentStep={5} totalSteps={6} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Store className="h-6 w-6" />
            <span>Store Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your store settings. You can change these later from the
            admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  placeholder="My Awesome Store"
                  value={formData.storeName}
                  onChange={(e) =>
                    handleInputChange("storeName", e.target.value)
                  }
                  className={errors.storeName ? "border-red-500" : ""}
                />
                {errors.storeName && (
                  <p className="text-sm text-red-600">{errors.storeName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeUrl">Store URL</Label>
                <Input
                  id="storeUrl"
                  placeholder="https://yourstore.com"
                  value={formData.storeUrl}
                  onChange={(e) =>
                    handleInputChange("storeUrl", e.target.value)
                  }
                  className={errors.storeUrl ? "border-red-500" : ""}
                />
                {errors.storeUrl && (
                  <p className="text-sm text-red-600">{errors.storeUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  placeholder="Brief description of your store..."
                  value={formData.storeDescription}
                  onChange={(e) =>
                    handleInputChange("storeDescription", e.target.value)
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) =>
                    handleInputChange("timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    handleInputChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              What happens next:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-200">
              <li>Store settings will be saved to the database</li>
              <li>Basic store structure will be created</li>
              <li>Sample data will be imported (optional)</li>
              <li>Installation will be completed</li>
            </ul>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={configureStore}
              disabled={isConfiguring}
              className="flex items-center space-x-2"
            >
              {isConfiguring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Configuring Store...</span>
                </>
              ) : (
                <>
                  <span>Complete Installation</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
