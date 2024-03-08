import { HeaderTab } from "@/components/ui/header-tab";
import {
  getAllDeposits,
  getAllPurchases,
} from "@/server/requests/historyRequests";
import { TableAndFilter } from "@/components/HistoryTable/TableAndFilter";
import { historyTabs } from "./layout";

export default async function HistoryPage() {
  const purchases = await getAllPurchases();
  const deposits = await getAllDeposits();

  const combinedData = [...purchases, ...deposits].sort((a, b) => {
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  return (
    <>
      <HeaderTab tabs={historyTabs} selectedTab="Overview" />
      <div className="flex h-full w-full flex-row justify-between gap-x-8 pb-4">
        <TableAndFilter initialData={combinedData} />
      </div>
    </>
  );
}
