import { auth } from "@/auth";
import {
	getCurrentUserDeposits,
	getCurrentUserPurchases,
} from "@/server/requests/historyRequests";
import { getCurrentUser } from "@/server/requests/userRequests";
import { UserView } from "./UserView";

export default async function UserProfile({
	params,
}: {
	params: { userId: string };
}) {
	const session = await auth();
	const loggedInUserId = session?.user?.user?.userId?.toString();
	const isCurrentUser = loggedInUserId === params.userId;

	if (!isCurrentUser) {
		throw new Error("Unauthorized: You can only view your own profile");
	}

	const user = await getCurrentUser();
	const depositHistory = await getCurrentUserDeposits();
	const purchaseHistory = await getCurrentUserPurchases();

	return (
		<UserView
			user={user}
			depositHistory={depositHistory}
			purchaseHistory={purchaseHistory}
		/>
	);
}
