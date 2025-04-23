import { TableAndFilter } from "@/components/HistoryTable/TableAndFilter";
import { HeaderTab } from "@/components/ui/header-tab";
import {
  getPagedDeposits,
  getPagedPurchases,
} from "@/server/requests/historyRequests";
import { historyTabs } from "./layout";

export default async function HistoryPage() {
  const page = 1;
  const limit = 100;

  const deposits = await getPagedDeposits(page, limit);
  const purchases = await getPagedPurchases(page, limit);

  const combinedData = [...purchases, ...deposits].sort((a, b) => {
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  return (
    <>
      <div>{combinedData.length} TOTAL LENGTH</div>
      <HeaderTab tabs={historyTabs} selectedTab="Overview" />
      <div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
        <TableAndFilter initialData={combinedData} />
      </div>
      <div className="flex justify-between mt-4">
        <a
          href={`?page=${page > 1 ? page - 1 : 1}`}
          className={`btn ${page === 1 ? "btn-disabled" : ""}`}
        >
          Previous
        </a>
        <a
          href={`?page=${page + 1}`}
          className={`btn ${combinedData.length < limit ? "btn-disabled" : ""}`}
        >
          Next
        </a>
      </div>
    </>
  );
}