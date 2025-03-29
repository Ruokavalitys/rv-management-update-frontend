import { TableAndFilter } from "@/components/HistoryTable/TableAndFilter";
import { HeaderTab } from "@/components/ui/header-tab";
import { getAllDeposits } from "@/server/requests/historyRequests";
import { historyTabs } from "../layout";

export default async function DepositsPage() {
	const deposits = await getAllDeposits();

	return (
		<>
			<HeaderTab tabs={historyTabs} selectedTab="Deposits" />
			<div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
				<TableAndFilter initialData={deposits} />
			</div>
		</>
	);
}
