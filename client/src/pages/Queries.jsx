import { useState } from "react";
import QueryForm from "../components/queries/QueryForm";
import QueryTable from "../components/queries/QueryTable";
import { useSearchParams } from "react-router-dom";

export default function Queries() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchParams] = useSearchParams();
  const accountRef = searchParams.get("account") || "";

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {accountRef ? (
        <>
          <QueryForm onSuccess={handleSuccess} />
          <QueryTable refreshKey={refreshKey} />
        </>
      ) : (
        <div className="text-center p-6 text-gray-600 bg-white rounded shadow">
          Select an account from Dashboard to view Queries.
        </div>
      )}
    </div>
  );
}
