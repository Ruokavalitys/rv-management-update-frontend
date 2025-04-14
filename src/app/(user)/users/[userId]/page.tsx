import { auth } from "@/auth";
import {
	getCurrentUserDeposits,
	getCurrentUserPurchases,
} from "@/server/requests/historyRequests";
import { getCurrentUser } from "@/server/requests/userRequests";
import { UserView } from "./UserView";

export async function getCurrentUserReturnHistory() {
const purchases = await getCurrentUserPurchases();
const returns = purchases.filter(purchase => purchase.returned);

const processedReturns = returns.map(returnedPurchase => {
    const ReturnEvent = {
      ...returnedPurchase,
      time: returnedPurchase.returnedTime,
      isReturnAction: true
    };
    return ReturnEvent;
  });
  return processedReturns;
}

export async function getCurrentUserPurchaseEvents() {
  const purchases = await getCurrentUserPurchases();

  const processedPurchases = purchases.map(purchase => {
	const PurchaseEvent = {
	  ...purchase,
	  isReturnAction: false
	};
	return PurchaseEvent;
  });
  return processedPurchases;
}

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
	const purchaseHistory = await getCurrentUserPurchaseEvents();
	const returnHistory = await getCurrentUserReturnHistory();

	return (
		<UserView
			user={user}
			depositHistory={depositHistory}
			purchaseHistory={purchaseHistory}
			returnHistory={returnHistory}
		/>
	);
}
