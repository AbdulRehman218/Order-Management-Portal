import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import api from "../services/api";
import Modal from "../components/ui/Modal";
import { useTheme } from "../context/ThemeContext";

export default function Trash() {
  const { primaryColor } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const viewUser = searchParams.get("user") || undefined;
  const accountRef = searchParams.get("account") || undefined;
  const [permanentOrder, setPermanentOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const fetchDeletedOrders = useCallback(async () => {
    try {
      const response = await api.get("/orders/deleted", { params: { user: viewUser, account: accountRef } });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch deleted orders:", error);
    } finally {
      setLoading(false);
    }
  }, [viewUser, accountRef]);

  useEffect(() => {
    if (accountRef) {
      fetchDeletedOrders();
    } else {
      setLoading(false);
    }
  }, [accountRef, fetchDeletedOrders]);

  const handleRestore = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/restore`, null, { params: viewUser ? { user: viewUser } : undefined });
      fetchDeletedOrders();
    } catch (error) {
      console.error("Failed to restore order:", error);
      alert("Failed to restore order");
    }
  };

  const handlePermanentDelete = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}/permanent`, { params: viewUser ? { user: viewUser } : undefined });
      setPermanentOrder(null);
      fetchDeletedOrders();
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    } catch (error) {
      console.error("Failed to delete order permanently:", error);
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await api.post("/orders/delete-multiple", { orderIds: selectedOrders }, { params: viewUser ? { user: viewUser } : undefined });
      setShowBulkDelete(false);
      setSelectedOrders([]);
      setIsSelecting(false);
      fetchDeletedOrders();
    } catch (error) {
      console.error("Failed to delete orders:", error);
      alert("Failed to delete selected orders");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading trash...</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Trash (Deleted Orders)</h2>
        <div className="flex gap-2">
          {orders.length > 0 && (
            <button
              onClick={() => {
                setIsSelecting(!isSelecting);
                setSelectedOrders([]);
              }}
              className={`px-4 py-2 rounded-full shadow transition-all flex items-center gap-2 ${
                isSelecting ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "text-white hover:opacity-90"
              }`}
              style={!isSelecting ? { backgroundColor: primaryColor } : {}}
            >
              {isSelecting ? "Cancel Selection" : "Select Multiple"}
            </button>
          )}
          {isSelecting && selectedOrders.length > 0 && (
            <button
              onClick={() => setShowBulkDelete(true)}
              className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 flex items-center gap-2 transition-all"
            >
              <Trash2 size={16} /> Delete Selected ({selectedOrders.length})
            </button>
          )}
        </div>
      </div>
      {!accountRef ? (
        <p className="text-gray-500 text-center">Select an account from Dashboard to view Trash.</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center">Trash is empty</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {isSelecting && (
                <th className="p-2 w-10">
                  {/* Empty header for checkbox column */}
                </th>
              )}
              <th className="p-2 text-left">Order ID</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Deleted At</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                {isSelecting && (
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleSelectOrder(order._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                )}
                <td className="p-2">{order.orderId}</td>
                <td className="p-2">{order.sku}</td>
                <td className="p-2 text-gray-500">
                  {new Date(order.updatedAt).toLocaleDateString()}
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handleRestore(order._id)}
                    className="text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-full cursor-pointer border border-green-200"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => setPermanentOrder(order)}
                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <Modal open={Boolean(permanentOrder) || showBulkDelete} onClose={() => { setPermanentOrder(null); setShowBulkDelete(false); }}>
        {(permanentOrder || showBulkDelete) && (
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500 shadow-sm">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {showBulkDelete ? "Delete Selected Orders?" : "Delete Forever?"}
              </h3>
              <p className="text-gray-500 mt-2 max-w-xs">
                {showBulkDelete 
                  ? `Are you sure you want to permanently delete ${selectedOrders.length} selected orders? This action cannot be undone.`
                  : "This action cannot be undone. This order will be permanently removed from the database."}
              </p>
            </div>

            {permanentOrder && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                  <span className="font-mono font-semibold text-gray-700">{permanentOrder.orderId}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">SKU</span>
                  <span className="text-sm font-medium text-gray-900">{permanentOrder.sku}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deleted</span>
                  <span className="text-sm text-gray-500">{new Date(permanentOrder.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors cursor-pointer"
                onClick={() => { setPermanentOrder(null); setShowBulkDelete(false); }}
              >
                Cancel
              </button>
              <button
                className="py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                onClick={() => showBulkDelete ? handleBulkDelete() : handlePermanentDelete(permanentOrder._id)}
              >
                Delete Forever
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
