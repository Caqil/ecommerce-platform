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
import {
  CheckCircle,
  ExternalLink,
  Settings,
  ShoppingBag,
  Users,
  BarChart3,
} from "lucide-react";
import { InstallationProgress } from "@/components/setup/installation-progress";

export default function InstallationCompletePage() {
  const router = useRouter();
  const [isFinalizingSetup, setIsFinalizingSetup] = useState(true);
  const [storeConfig, setStoreConfig] = useState<any>(null);

  useEffect(() => {
    finalizeInstallation();
  }, []);

  const finalizeInstallation = async () => {
    try {
      const response = await fetch("/api/setup/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseCode: sessionStorage.getItem("purchase_code"),
          adminEmail: sessionStorage.getItem("admin_email"),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStoreConfig(data.store);

        // Clean up session storage
        sessionStorage.removeItem("license_verified");
        sessionStorage.removeItem("purchase_code");
        sessionStorage.removeItem("database_configured");
        sessionStorage.removeItem("mongo_uri");
        sessionStorage.removeItem("admin_created");
        sessionStorage.removeItem("admin_email");
        sessionStorage.removeItem("store_configured");
      }
    } catch (error) {
      console.error("Finalization error:", error);
    } finally {
      setIsFinalizingSetup(false);
    }
  };

  const handleGoToAdmin = () => {
    window.location.href = "/admin";
  };

  const handleGoToStore = () => {
    window.location.href = "/";
  };

  return (
    <div className="space-y-8">
      <InstallationProgress currentStep={6} totalSteps={6} />

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-600">
            Installation Complete!
          </CardTitle>
          <CardDescription className="text-lg">
            Congratulations! Your eCommerce platform has been successfully
            installed and configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {storeConfig && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Store Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Store Name:
                  </span>
                  <span className="ml-2 text-blue-700 dark:text-blue-300">
                    {storeConfig.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Currency:
                  </span>
                  <span className="ml-2 text-blue-700 dark:text-blue-300">
                    {storeConfig.currency}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Admin Email:
                  </span>
                  <span className="ml-2 text-blue-700 dark:text-blue-300">
                    {storeConfig.adminEmail}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Country:
                  </span>
                  <span className="ml-2 text-blue-700 dark:text-blue-300">
                    {storeConfig.country}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Quick Actions</h3>

              <Button
                onClick={handleGoToAdmin}
                className="w-full flex items-center justify-between"
                size="lg"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Access Admin Panel</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleGoToStore}
                variant="outline"
                className="w-full flex items-center justify-between"
                size="lg"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>View Your Store</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Next Steps</h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Add Products</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Start by adding your first products to the catalog
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Configure Payment</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Install payment gateway addons to accept payments
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Customize Design</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Customize your store appearance and branding
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Important Security Notes:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
              <li>Change default passwords and review security settings</li>
              <li>Configure SSL certificate for your domain</li>
              <li>Set up regular database backups</li>
              <li>Keep your platform and addons updated</li>
            </ul>
          </div>

          <div className="text-center pt-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Need help getting started? Check out our documentation and support
              resources.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="sm">
                📚 Documentation
              </Button>
              <Button variant="outline" size="sm">
                💬 Support
              </Button>
              <Button variant="outline" size="sm">
                🎥 Video Tutorials
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
