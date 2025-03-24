import AdminNavigation from "./nav";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="flex min-h-screen">
			<AdminNavigation />
			<div className="h-screen w-full rounded-l-2xl border border-stone-300 bg-white px-10 shadow-xl">
				{children}
			</div>
		</main>
	);
}
