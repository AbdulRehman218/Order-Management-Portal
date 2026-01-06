import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import QueryRow from "./QueryRow";
import Modal from "../ui/Modal";
import { useAuth } from "../../context/useAuth";
import { Search } from "lucide-react";

export default function QueryTable({ refreshKey }) {
  const [searchParams] = useSearchParams();
  const viewUser = searchParams.get("user") || undefined;
  const accountRef = searchParams.get("account") || undefined;
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState(null);
  const [showQuery, setShowQuery] = useState(null);
  const [editQuery, setEditQuery] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQueries = useCallback(async () => {
    try {
      const response = await api.get("/queries", { params: { user: viewUser, account: accountRef } });
      setQueries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch queries:", error);
    } finally {
      setLoading(false);
    }
  }, [viewUser, accountRef]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries, refreshKey]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <div className="text-center p-4">Loading queries...</div>
      </div>
    );
  }

  const filteredQueries = queries.filter(q => {
    const term = searchTerm.toLowerCase();
    return (
      (q.orderId || "").toLowerCase().includes(term) ||
      (q.sku || "").toLowerCase().includes(term) ||
      (q.handlerName || "").toLowerCase().includes(term) ||
      (q.message || "").toLowerCase().includes(term) ||
      (q.status || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white p-4 rounded shadow transition-colors duration-300">
      <div className="relative mb-6 flex items-center">
        <h2 className="font-bold text-lg hidden md:block absolute left-0">Queries List</h2>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Order No</th>
            <th className="p-2 text-left">Details</th>
            <th className="p-2 text-left">Handler</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Time Remaining</th>
            <th className="p-2 text-left">Date & Time</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredQueries.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                {queries.length === 0 ? "No queries found" : "No matching queries found"}
              </td>
            </tr>
          ) : (
            filteredQueries.map((query) => (
              <QueryRow
                key={query._id}
                query={query}
                canDelete={((user?.role || "").toLowerCase() === "admin") || !viewUser || viewUser === user?.id || viewUser === user?._id}
                onDelete={(id) => setDeleteId(id)}
                onShow={(q) => setShowQuery(q)}
                onEdit={(q) => {
                  setEditError("");
                  setEditQuery({
                    _id: q._id,
                    message: q.message || "",
                    status: q.status || "inprogress",
                    expiresAt: q.expiresAt ? new Date(q.expiresAt).toISOString().slice(0, 16) : ""
                  });
                }}
              />
            ))
          )}
        </tbody>
      </table>
      
      <Modal open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <h3 className="text-lg font-bold mb-2">Delete Query</h3>
        <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this query?</p>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 rounded bg-gray-200" onClick={() => setDeleteId(null)}>Cancel</button>
          <button
            className="px-3 py-2 rounded bg-red-600 text-white cursor-pointer"
            onClick={async () => {
              if (!deleteId) return;
              try {
                await api.delete(`/queries/${deleteId}`, { params: viewUser ? { user: viewUser } : undefined });
                setDeleteId(null);
                fetchQueries();
              } catch {
                setDeleteId(null);
              }
            }}
          >
            Delete
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(showQuery)} onClose={() => setShowQuery(null)}>
        <h3 className="text-lg font-bold mb-3">Query Details</h3>
        {showQuery && (
          <div className="space-y-2 text-sm">
            <div><span className="font-semibold">Order No:</span> {showQuery.orderId || "-"}</div>
            <div><span className="font-semibold">SKU:</span> {showQuery.sku || "-"}</div>
            <div><span className="font-semibold">Details:</span> {showQuery.details || "-"}</div>
            <div><span className="font-semibold">Handler:</span> {showQuery.handlerName || "-"}</div>
            <div><span className="font-semibold">Message:</span> {showQuery.message || "-"}</div>
            <div><span className="font-semibold">Answer:</span> {showQuery.answer || "-"}</div>
            <div><span className="font-semibold">Status:</span> {showQuery.status || "-"}</div>
            <div><span className="font-semibold">Expiry:</span> {showQuery.expiresAt ? new Date(showQuery.expiresAt).toLocaleString() : "-"}</div>
            <div><span className="font-semibold">Created:</span> {showQuery.createdAt ? new Date(showQuery.createdAt).toLocaleString() : "-"}</div>
          </div>
        )}
        <div className="mt-4 text-right">
          <button className="px-3 py-2 rounded bg-gray-200" onClick={() => setShowQuery(null)}>Close</button>
        </div>
      </Modal>

      <Modal open={Boolean(editQuery)} onClose={() => setEditQuery(null)}>
        <h3 className="text-lg font-bold mb-3">Edit Query</h3>
        {editError && (
          <div className="mb-3 p-2 bg-red-100 text-red-600 rounded text-sm">{editError}</div>
        )}
        {editQuery && (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setEditSaving(true);
              setEditError("");
              try {
                await api.put(
                  `/queries/${editQuery._id}`,
                  {
                    message: editQuery.message,
                    status: editQuery.status,
                    expiresAt: editQuery.expiresAt ? new Date(editQuery.expiresAt).toISOString() : null
                  },
                  { params: viewUser ? { user: viewUser } : undefined }
                );
                setEditSaving(false);
                setEditQuery(null);
                fetchQueries();
              } catch (err) {
                setEditSaving(false);
                setEditError(err.response?.data?.message || "Failed to save changes");
              }
            }}
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">Message</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={editQuery.message}
                onChange={(e) => setEditQuery((q) => ({ ...q, message: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  className="w-full p-2 border rounded"
                  value={editQuery.status}
                  onChange={(e) => setEditQuery((q) => ({ ...q, status: e.target.value }))}
                >
                  <option value="inprogress">In Progress</option>
                  <option value="notresolved">Not Resolved</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Expiry Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded"
                  value={editQuery.expiresAt}
                  onChange={(e) => setEditQuery((q) => ({ ...q, expiresAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                className="px-3 py-2 rounded bg-gray-200 mr-2 cursor-pointer"
                onClick={() => setEditQuery(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50 cursor-pointer"
                disabled={editSaving}
              >
                {editSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
