import { Deposit } from "@/server/requests/historyRequests";

const depositTypeMapping: { [key: number]: string } = {
  17: "Deposit",
  26: "Cash",
  27: "Bank Transfer"
};
 
export const DepositRow = ({ deposit }: { deposit: Deposit }) => {
  return (
    <div
      key={deposit.depositId}
      className="inline-grid w-full cursor-pointer grid-cols-5 border-b border-gray-200 px-4 py-3 transition-all hover:bg-stone-100"
    >
      <div className="whitespace-nowrap">
        <h3 className="text-lg font-semibold">{deposit.user.username}</h3>
        <p className="text-sm text-stone-500">{deposit.user.fullName}</p>
      </div>

      <div className="place-self-center self-center">
        <p>
          {new Date(Date.parse(deposit.time)).toLocaleDateString()}
          {" - "}
          {new Date(Date.parse(deposit.time)).toLocaleTimeString()}
        </p>
      </div>

      <div className="place-self-center self-center">
        <p>Deposited</p>
      </div>

      <div className="place-self-center self-center">
        <p>
          {depositTypeMapping[deposit.type]}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <p className="text-sm text-stone-300">
          <span
            className={`font-semibold ${deposit.balanceAfter - deposit.amount < 0 ? "text-red-500" : ""}`}
          >
            {((deposit.balanceAfter - deposit.amount) / 100).toFixed(2)} €
          </span>{" "}
          <span className={`text-lg font-semibold text-black`}>
            + {(deposit.amount / 100).toFixed(2)} €
          </span>{" "}
          ={" "}
          <span
            className={`font-semibold ${deposit.balanceAfter < 0 ? "text-red-500" : ""}`}
          >
            {(deposit.balanceAfter / 100).toFixed(2)}
          </span>{" "}
          €
        </p>
        <p className="text-sm text-stone-500">{deposit.user.email}</p>
      </div>
    </div>
  );
};
