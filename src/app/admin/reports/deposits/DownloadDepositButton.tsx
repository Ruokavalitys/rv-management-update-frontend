'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Deposit } from "@/server/requests/reportDepositService";
import { ComponentProps } from "react";

export default function DownloadDepositButton({
  deposits,
  ...rest
}: { deposits: Deposit[] } & ComponentProps<typeof Button>) {
  const handleDownload = () => {
    const header = ["Name", "Date & Time", "Amount", "Type"];
    const rows = deposits.map((d) => [d.name, d.datetime, d.amount.toFixed(2), d.type]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "deposit_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default" {...rest}>
          Download CSV
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Download Deposit Report?</AlertDialogTitle>
          <AlertDialogDescription>
            This will generate and download the deposit report as a CSV file.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleDownload}>
              Confirm Download
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
