import { TableAndFilter } from "@/components/HistoryTable/TableAndFilter";
import { HeaderTab } from "@/components/ui/header-tab";
import { getAllPurchases } from "@/server/requests/historyRequests";
import { historyTabs } from "../layout";

export default async function PurchasesPage() {
	const purchases = await getAllPurchases();

	return (
		<>
			<HeaderTab tabs={historyTabs} selectedTab="Purchases" />
			<div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
				<TableAndFilter initialData={purchases} />
			</div>
		</>
	);
}
