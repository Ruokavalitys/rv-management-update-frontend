function UserLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-full w-full flex-col items-start justify-start gap-y-4 rounded-lg border p-8 shadow-lg">
			<div className="relative flex h-full w-full flex-col gap-y-4">
				{children}
			</div>
		</div>
	);
}

export default UserLayout;
