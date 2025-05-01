import { TableAndFilter } from "@/components/HistoryTable/TableAndFilter";
import { HeaderTab } from "@/components/ui/header-tab";
import { getPagedPurchases } from "@/server/requests/historyRequests";
import { historyTabs } from "../layout";


export default async function ReturnsPage({ searchParams }: { searchParams: { page?: string; limit?: string } }) {
  const page = parseInt(searchParams.page || "1", 10);
  const limit = parseInt(searchParams.limit || "10", 10);

  const { purchases, count } = await getPagedPurchases(page, limit);
  const returns = purchases.filter(all => all.returned)
  const totalPages = Math.ceil(returns.length / limit);
  const isLastPage = page >= totalPages;


  return (
    <>
      <HeaderTab tabs={historyTabs} selectedTab="Returns" />
      <div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
        <TableAndFilter initialData={returns} />
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