import { auth, signOut } from "@/auth";
import { NavButton } from "@/components/NavButton";
import { SubmitButton } from "@/components/ui/submit-button";
import { BookUser, LogOut, PackageSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function UserNavigation() {
	const session = await auth();
	const user = session?.user;

	const routes = user
		? [
				{
					href: "/products",
					title: "Products",
					icon: <PackageSearch />,
				},
				{
					href: `/users/${user.user.userId}`,
					title: "My account",
					icon: <BookUser />,
				},
			]
		: [];

	return (
		<nav className="flex max-h-screen w-64 flex-col justify-between overflow-y-auto p-8">
			<div className="flex flex-col items-start gap-y-2">
				<Link href={"/products"}>
					<div className="mb-4 flex flex-col gap-y-2">
						<Image
							src={"/rv-logo.png"}
							alt="Ruokavälitys"
							height={48}
							width={150}
							className="w-auto"
							priority
						/>
						<h1 className="text-2xl font-semibold">Ruokavälitys</h1>
					</div>
				</Link>
				{routes.map((route) => (
					<NavButton key={route.title} icon={route.icon} href={route.href}>
						{route.title}
					</NavButton>
				))}
			</div>

			<div className="flex flex-col items-center gap-y-2 w-full">
				<form
					action={async () => {
						"use server";
						await signOut({ redirectTo: "/" });
					}}
					className="w-full"
				>
					<SubmitButton
						icon={<LogOut />}
						variant="ghost"
						className="flex h-auto w-full justify-center gap-x-2 rounded-lg border-2 border-transparent p-3 hover:bg-stone-200 focus-visible:bg-stone-200 focus-visible:outline-none"
					>
						Log out
					</SubmitButton>
				</form>
				{user && (
					<p className="text-xs text-stone-600">
						Logged in as{" "}
						<Link href={`/users/${user.user.userId}`}>
							<span className="font-bold">{user.user.username}</span>
						</Link>
					</p>
				)}
			</div>
		</nav>
	);
}
