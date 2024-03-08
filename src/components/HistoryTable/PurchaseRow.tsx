import { Purchase } from "@/server/requests/historyRequests";

export const PurchaseRow = ({ purchase }: { purchase: Purchase }) => {
  return (
    <div
      key={purchase.purchaseId}
      className="inline-grid w-full cursor-pointer grid-cols-3 border-b border-gray-200 p-4 transition-all hover:bg-stone-100"
    >
      <div className="whitespace-nowrap">
        <h3 className="text-lg font-semibold">{purchase.user.username}</h3>
        <p className="text-sm text-stone-500">{purchase.user.fullName}</p>
      </div>

      <div className="place-self-center self-center">
        <p>
          {new Date(Date.parse(purchase.time)).toLocaleDateString()}
          {" - "}
          {new Date(Date.parse(purchase.time)).toLocaleTimeString()}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <p className="text-sm text-stone-300">
          <span
            className={`font-semibold ${purchase.balanceAfter + purchase.price < 0 ? "text-red-500" : ""}`}
          >
            {((purchase.balanceAfter + purchase.price) / 100).toFixed(2)} €
          </span>{" "}
          <span className={`text-lg font-semibold text-black`}>
            - {(purchase.price / 100).toFixed(2)} €
          </span>{" "}
          ={" "}
          <span
            className={`font-semibold ${purchase.balanceAfter < 0 ? "text-red-500" : ""}`}
          >
            {(purchase.balanceAfter / 100).toFixed(2)}
          </span>{" "}
          €
        </p>
        <p className="text-sm text-stone-500">{purchase.user.email}</p>
      </div>
    </div>
  );
};
