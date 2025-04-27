"use client";

import { UserRole } from "@/server/requests/types";
import { useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const userFiltersAtom = atomWithReset({
	search: "",
	role: {
		admin: true,
		user1: true,
		user2: true,
		inactive: false,
	},
	balanceFilter: "none",
});

const rolePriority = {
	[UserRole.ADMIN]: 1,
	[UserRole.USER1]: 2,
	[UserRole.USER2]: 3,
	[UserRole.INACTIVE]: 4,
};

function UserTable({ users }) {
	const filters = useAtomValue(userFiltersAtom);
	const path = usePathname();

	const userPathRegex = /\/users\/\d+/g;
	const className = `${
		userPathRegex.test(path) ? "hidden xl:flex" : "flex"
	} h-full w-full overflow-y-auto rounded-lg border shadow-lg`;

	const filteredUsers = users
		.filter((user) => {
			if (filters.search && filters.search.length > 0) {
				const searchLower = filters.search.toLowerCase();
				return (
					user.username.toLowerCase().includes(searchLower) ||
					user.fullName.toLowerCase().includes(searchLower)
				);
			}
			return true;
		})
		.filter((user) => {
			if (!filters.role.admin && user.role === UserRole.ADMIN) return false;
			if (!filters.role.user1 && user.role === UserRole.USER1) return false;
			if (!filters.role.user2 && user.role === UserRole.USER2) return false;
			if (!filters.role.inactive && user.role === UserRole.INACTIVE)
				return false;
			return true;
		})
		.filter((user) => {
			if (filters.balanceFilter === "positive") return user.moneyBalance > 0;
			if (filters.balanceFilter === "negative") return user.moneyBalance < 0;
			return true;
		});

	const sortedUsers = [...filteredUsers].sort((a, b) => {
		const roleDiff = rolePriority[a.role] - rolePriority[b.role];
		if (roleDiff !== 0) return roleDiff;
		return a.username.localeCompare(b.username);
	});

	return (
		<div className={className}>
			<div className="w-full">
				<div className="inline-grid w-full grid-cols-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 font-semibold rounded-t-lg">
					<div className="whitespace-nowrap flex items-center gap-x-1 select-none">
						Username
					</div>
					<div className="place-self-center flex items-center gap-x-1 select-none">
						Role
					</div>
					<div className="text-right flex items-center justify-end gap-x-1 select-none">
						Balance
					</div>
				</div>
				{sortedUsers.length === 0 && (
					<div className="flex h-64 items-center justify-center">
						<p className="text-stone-500">No users found</p>
					</div>
				)}
				{sortedUsers.map((user) => (
					<Link
						href={`/admin/users/${user.userId}`}
						key={user.userId}
						className="inline-grid w-full cursor-pointer grid-cols-3 border-b border-gray-200 px-4 py-3 transition-all hover:bg-stone-100"
					>
						<div className="whitespace-nowrap">
							<h3 className="text-lg font-semibold">{user.username}</h3>
							<p className="text-sm text-stone-500">{user.fullName}</p>
						</div>
						<div className="place-self-center self-center">
							<p
								className={
									user.role === UserRole.ADMIN
										? "text-purple-600"
										: "text-stone-500"
								}
							>
								{user.role}
							</p>
						</div>
						<div className="flex flex-col items-end">
							<p
								className={`font-semibold ${
									user.moneyBalance < 0 ? "text-red-500" : "text-black"
								}`}
							>
								{(user.moneyBalance / 100).toFixed(2)} €
							</p>
							<p className="text-lg text-stone-500">{user.email}</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

export default UserTable;
