import OrderTable from "../components/orders/OrderTable";
import { useSearchParams } from "react-router-dom";
 

export default function Orders() {
  const [searchParams] = useSearchParams();
  const accountRef = searchParams.get("account") || "";
 

  return (
    <div className="bg-white p-4 rounded shadow  light:text-white transition-colors duration-300">
      {accountRef ? (
        <OrderTable />
      ) : (
        <div className="text-center p-6 text-gray-600">
          Select an account from Dashboard to view Orders.
        </div>
      )}
    </div>
  );
}
