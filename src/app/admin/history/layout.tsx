import { HeaderTabs } from "@/components/ui/header-tab";

export const historyTabs: HeaderTabs = {
	Overview: { href: "/admin/history" },
	Deposits: { href: "/admin/history/deposits" },
	Purchases: { href: "/admin/history/purchases" },
};

async function HistoryLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-full w-full flex-col gap-y-4 pb-10 pt-6">
			{children}
		</div>
	);
}

export default HistoryLayout;
