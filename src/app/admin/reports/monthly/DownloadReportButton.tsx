"use client";

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
import { ComponentProps } from "react";

type Report = {
	month: string;
	purchases: number;
  bottleReturns: number;
	productReturns: number;
	bottleReturnRefunds: number;
	bankDeposits: number;
	cashDeposits: number;
	totalUserBalance: number;
};

const DownloadReportButton = ({
  reports,
  ...rest
}: { reports: Report[] } & ComponentProps<typeof Button>) => {
  
  const handleDownload = () => {
    const csvContent =
      "Month,Bottle Returns,Purchases,Product Returns,Bottle Return Refunds,Bank Deposits,Cash Deposits,Total User Balance\n" +
      reports
        .map((report) =>
          [
            report.month,
            report.purchases,
            report.bottleReturns,
            report.productReturns,
            report.bankDeposits,
            report.cashDeposits,
            report.totalUserBalance,
          ].join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial_report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
          <AlertDialogTitle>Download Financial Report?</AlertDialogTitle>
          <AlertDialogDescription>
            This will generate and download the financial report as a CSV file.
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
};

export default DownloadReportButton;
