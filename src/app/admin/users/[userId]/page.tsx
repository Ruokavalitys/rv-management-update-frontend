import {
  getUser,
  getUserDepositHistory,
  getUserPurchaseHistory,
} from "@/server/requests/userRequests";
import { UserView } from "./UserView";

export async function getUserReturnHistory(userId: number) {
  const purchases = await getUserPurchaseHistory(userId);
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

export async function getUserPurchaseEvents(userId: number) {
  const purchases = await getUserPurchaseHistory(userId);

  const processedPurchases = purchases.map(purchase => {
    const PurchaseEvent = {
      ...purchase,
      isReturnAction: false
    };
    return PurchaseEvent;
  });
  return processedPurchases;
}

export default async function Product({
  params,
}: {
  params: { userId: string };
}) {
  const user = await getUser(params.userId);
  const depositHistory = await getUserDepositHistory(user.userId);
  const purchaseHistory = await getUserPurchaseEvents(user.userId);
  const returnHistory = await getUserReturnHistory(user.userId);

  return (
    <UserView
      user={user}
      depositHistory={depositHistory}
      purchaseHistory={purchaseHistory}
      returnHistory={returnHistory}
    />
  );
}
