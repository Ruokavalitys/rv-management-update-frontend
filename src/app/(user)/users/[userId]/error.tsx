"use client";

import { Button } from "@/components/ui/button";

export default function UserError({
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return (
		<div className="flex flex-col gap-y-2">
			<h1 className="text-2xl font-semibold">Error occurred</h1>
			<div>
				<Button onClick={reset}>Try again</Button>
			</div>
		</div>
	);
}
