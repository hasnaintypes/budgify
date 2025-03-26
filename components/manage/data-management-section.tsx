"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Database, FileX } from "lucide-react";

export function DataManagementSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Manage your data, backups, and exports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Export Data</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Export your transaction data in various formats for backup or
              analysis
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                JSON
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Import Data</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Import transaction data from external sources or backups
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, Excel, JSON
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Backup & Restore</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-backup">Automatic Backups</Label>
              <Select defaultValue="weekly">
                <SelectTrigger id="data-backup">
                  <SelectValue placeholder="Select backup frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Create Manual Backup
              </Button>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-2">Recent Backups</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Backup_2025-03-25.zip</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Restore
                  </Button>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Backup_2025-03-18.zip</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Restore
                  </Button>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileX className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-medium">Danger Zone</h3>
          </div>

          <div className="border border-destructive/20 rounded-md p-4 bg-destructive/5">
            <div className="flex flex-col gap-2">
              <h4 className="font-medium">Delete All Data</h4>
              <p className="text-sm text-muted-foreground mb-2">
                This action will permanently delete all your transactions,
                categories, and settings. This cannot be undone.
              </p>
              <Button variant="destructive" size="sm" className="w-fit">
                Delete All Data
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
