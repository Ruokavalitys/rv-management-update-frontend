import Link from "next/link";

export type HeaderTabs = Record<string, { href: string }>;
export type HeaderTabProps = {
	tabs: HeaderTabs;
	selectedTab: keyof HeaderTabs;
};

export const HeaderTab = ({ tabs, selectedTab }: HeaderTabProps) => {
	return (
		<div className="flex gap-x-4">
			{Object.entries(tabs).map(([label, tab]) => {
				if (label === selectedTab) {
					return (
						<h1 key={label} className="text-3xl font-semibold">
							{label}
						</h1>
					);
				}

				return (
					<Link
						key={label}
						href={tab.href}
						className="text-3xl font-semibold text-gray-300 underline-offset-8 transition-all duration-100 hover:underline focus-visible:underline focus-visible:outline-none"
					>
						{label}
					</Link>
				);
			})}
		</div>
	);
};
