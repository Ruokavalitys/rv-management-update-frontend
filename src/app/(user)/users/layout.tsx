async function UsersLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-full w-full flex-col gap-y-4 pb-10 pt-6">
			<h1 className="text-3xl font-semibold">My account</h1>
			<div className="flex h-full min-h-0 w-full flex-row justify-between gap-x-8">
				{children}
			</div>
		</div>
	);
}

export default UsersLayout;
