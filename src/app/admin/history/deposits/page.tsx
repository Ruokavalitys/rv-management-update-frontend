import { TableAndFilter } from "@/components/HistoryTable/TableAndFilter";
import { HeaderTab } from "@/components/ui/header-tab";
import { getPagedDeposits } from "@/server/requests/historyRequests";
import { historyTabs } from "../layout";


export default async function DepositsPage({ searchParams }: { searchParams: { page?: string; limit?: string } }) {
  const page = parseInt(searchParams.page || "1", 10);
  const limit = parseInt(searchParams.limit || "10", 10);

  const deposits = await getPagedDeposits(page, limit);

  return (
    <>
      <HeaderTab tabs={historyTabs} selectedTab="Deposits" />
      <div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
        <TableAndFilter initialData={deposits} />
      </div>
      <div className="flex justify-between mt-4">
        <a
          href={`?page=${page > 1 ? page - 1 : 1}&limit=${limit}`}
          className={`btn ${page === 1 ? "btn-disabled" : ""}`}
        >
          Previous
        </a>
        <a
          href={`?page=${page + 1}&limit=${limit}`}
          className={`btn ${deposits.length < limit ? "btn-disabled" : ""}`}
        >
          Next
        </a>
      </div>
    </>
  );
}