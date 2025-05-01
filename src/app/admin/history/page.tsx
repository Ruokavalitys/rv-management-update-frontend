import { TableAndFilter } from "@/components/HistoryTable/TableAndFilter";
import { HeaderTab } from "@/components/ui/header-tab";
import {
  getAllDeposits,
  getAllPurchases,
  getPagedDeposits,
  getPagedPurchases
} from "@/server/requests/historyRequests";
import { historyTabs } from "./layout";

//aivan hirveetä koodia, mutta se toimii
export default async function HistoryPage({ searchParams }: { searchParams: { page?: string; limit?: string } }) {
  const page = parseInt(searchParams.page || "1", 10);
  const limit = parseInt(searchParams.limit || "100", 10);

  const deposits = await getAllDeposits();
  const purchases = await getAllPurchases();

  //nää on tässä vaan paginointia varten
  const { deposits: ddd, count: depocount } = await getPagedDeposits(page, limit);
  const { purchases: asd, count: purchasecount } = await getPagedPurchases(page, limit); 

  const combinedData = [...purchases, ...deposits].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  const startIndex = (page - 1) * limit;
  const paginatedData = combinedData.slice(startIndex, startIndex + limit);

  const combinedCount = depocount + purchasecount;
  const totalPages = Math.ceil(combinedCount / limit);
  const isLastPage = page >= totalPages;

  return (
    <>
      <HeaderTab tabs={historyTabs} selectedTab="Overview" />
      <div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
        <TableAndFilter initialData={paginatedData} />
      </div>
      <div className="flex justify-between mt-4">
        {page != 1 && (
          <a
            href={`?page=${page > 1 ? page - 1 : 1}`}
            className={`btn ${page === 1 ? "btn-disabled" : ""}`}
          >
            Previous
          </a>
        )}
        <>page:{page}</>
        {!isLastPage && (
          <a
            href={`?page=${page + 1}`}
            className="btn"
          >
            Next
          </a>
        )}
      </div>
    </>
  );
}