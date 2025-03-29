import { HeaderTabs } from "@/components/ui/header-tab";

export const historyTabs: HeaderTabs = {
<<<<<<< HEAD
  Overview: { href: "/admin/history" },
  Deposits: { href: "/admin/history/deposits" },
  Purchases: { href: "/admin/history/purchases" },
  Returns: { href: "/admin/history/returns" },
=======
	Overview: { href: "/admin/history" },
	Deposits: { href: "/admin/history/deposits" },
	Purchases: { href: "/admin/history/purchases" },
>>>>>>> 7fdd56538c42bbaa59d9bb992b4e4808e385f19b
};

async function HistoryLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-full w-full flex-col gap-y-4 pb-10 pt-6">
			{children}
		</div>
	);
}

export default HistoryLayout;
