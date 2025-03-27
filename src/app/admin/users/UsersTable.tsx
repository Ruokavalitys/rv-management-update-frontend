"use client";

import { UserRole } from "@/server/requests/types";
import { useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

function UserTable({ users }) {
	const filters = useAtomValue(userFiltersAtom);
	const path = usePathname();

	const [sortConfig, setSortConfig] = useState({
		key: "username",
		direction: null,
	});

	const userPathRegex = /\/users\/\d+/g;
	const className = `${
		userPathRegex.test(path) ? "hidden xl:flex" : "flex"
	} h-full w-full overflow-y-auto rounded-lg border shadow-lg`;

	const handleSort = (key) => {
		setSortConfig((prev) => {
			if (prev.key !== key) {
				return { key, direction: "asc" };
			}
			if (prev.direction === "asc") {
				return { key, direction: "desc" };
			} else if (prev.direction === "desc") {
				return { key, direction: null };
			} else {
				return { key, direction: "asc" };
			}
		});
	};

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

	const sortedUsers =
		sortConfig.direction !== null
			? [...filteredUsers].sort((a, b) => {
					if (sortConfig.key === "username") {
						return sortConfig.direction === "asc"
							? a.username.localeCompare(b.username)
							: b.username.localeCompare(a.username);
					} else if (sortConfig.key === "role") {
						return sortConfig.direction === "asc"
							? a.role.localeCompare(b.role)
							: b.role.localeCompare(a.role);
					} else if (sortConfig.key === "balance") {
						return sortConfig.direction === "asc"
							? a.moneyBalance - b.moneyBalance
							: b.moneyBalance - a.moneyBalance;
					}
					return 0;
				})
			: filteredUsers;

	return (
		<div className={className}>
			<div className="w-full">
				<div className="inline-grid w-full grid-cols-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 font-semibold rounded-t-lg">
					<div
						className="whitespace-nowrap cursor-pointer flex items-center gap-x-1 select-none"
						onClick={() => handleSort("username")}
					>
						Username
						{sortConfig.key === "username" && sortConfig.direction !== null && (
							<span className="text-gray-600 text-sm font-normal">
								{sortConfig.direction === "asc" ? "↑" : "↓"}
							</span>
						)}
					</div>
					<div
						className="place-self-center cursor-pointer flex items-center gap-x-1 select-none"
						onClick={() => handleSort("role")}
					>
						Role
						{sortConfig.key === "role" && sortConfig.direction !== null && (
							<span className="text-gray-600 text-sm font-normal">
								{sortConfig.direction === "asc" ? "↑" : "↓"}
							</span>
						)}
					</div>
					<div
						className="text-right cursor-pointer flex items-center justify-end gap-x-1 select-none"
						onClick={() => handleSort("balance")}
					>
						Balance
						{sortConfig.key === "balance" && sortConfig.direction !== null && (
							<span className="text-gray-600 text-sm font-normal">
								{sortConfig.direction === "asc" ? "↑" : "↓"}
							</span>
						)}
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
