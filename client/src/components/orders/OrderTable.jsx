import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import OrderRow from "./OrderRow";
import OrderModal from "./OrderModal";
import Modal from "../ui/Modal";
import { useAuth } from "../../context/useAuth";

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const viewUser = searchParams.get("user") || undefined;
  const accountRef = searchParams.get("account") || undefined;
  const [deleteId, setDeleteId] = useState(null);
  const [refundOrder, setRefundOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const { user } = useAuth();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/orders", { params: { user: viewUser, account: accountRef } });
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.error("Orders data is not an array:", response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [viewUser, accountRef]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleEdit = (order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (orderId) => {
    setDeleteId(orderId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/orders/${deleteId}`, { params: viewUser ? { user: viewUser } : undefined });
      setDeleteId(null);
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order: " + (error.response?.data?.message || error.message));
      setDeleteId(null);
    }
  };

  const handleRefund = (order) => {
    setRefundOrder(order);
    setRefundAmount(order.refundAmount || 0);
  };

  const confirmRefund = async () => {
    if (!refundOrder) return;
    try {
      await api.put(
        `/orders/${refundOrder._id}`,
        {
          ...refundOrder,
          refundAmount: parseFloat(refundAmount) || 0
        },
        { params: viewUser ? { user: viewUser } : undefined }
      );
      setRefundOrder(null);
      setRefundAmount("");
      fetchOrders();
    } catch {
      setRefundOrder(null);
      setRefundAmount("");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading orders...</div>;
  }

  const applyDateRange = (list) => {
    const range = searchParams.get("range");
    if (!range) return list;
    const now = new Date();
    const start = new Date();
    if (range === "today") {
      start.setHours(0,0,0,0);
    } else if (range === "yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0,0,0,0);
      now.setDate(start.getDate());
      now.setHours(23,59,59,999);
    } else if (range === "week") {
      start.setDate(start.getDate() - 7);
    } else if (range === "month") {
      start.setMonth(start.getMonth() - 1);
    } else if (range === "year") {
      start.setFullYear(start.getFullYear() - 1);
    }
    return list.filter(o => {
      const d = new Date(o.createdAt);
      if (range === "yesterday") return d >= start && d <= now;
      return d >= start;
    });
  };

  const filteredOrders = applyDateRange(
    orders.filter((order) =>
      search
        ? (order.orderId || "").toLowerCase().includes(search.toLowerCase())
        : true
    )
  );

  return (
    <>
      <div className="mb-6 flex justify-between items-center gap-4 sticky top-0 z-10 bg-white py-4 -mt-4 shadow-sm border-b px-2">
        <h2 className="text-xl font-bold">Orders</h2>
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 w-full max-w-sm">
          <Search className="text-gray-500" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search OrderID"
            className="bg-transparent w-full px-2 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setEditingOrder(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-full hover:brightness-95 mt-2 cursor-pointer transition-colors"
        >
          Add Order
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow overflow-x-auto transition-colors duration-300">
      <table className="w-full text-sm min-w-[1400px] table-fixed border-collapse">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[40px]">NO</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[110px]">OrderID</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[120px]">SKU</th>
            <th className="px-1 py-3 text-left tracking-wide w-[180px]">Details</th>
            <th className="px-1 py-3 text-left tracking-wide w-[130px]">Status ID</th>
            <th className="px-1 py-3 text-left tracking-wide w-[140px]">TrackingID</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[110px]">Notes</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[80px]">Handler</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[80px]">Buy</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[80px]">Sell</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[80px]">Profit</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[90px]">Status</th>
            <th className="px-1 py-3 text-left whitespace-nowrap tracking-wide w-[140px]">Date&Time</th>
            <th className="px-1 py-3 text-center whitespace-nowrap tracking-wide w-[160px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="12" className="p-4 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          ) : (
            filteredOrders.filter(order => order).map((order, index) => (
              <OrderRow
                key={order._id || Math.random()}
                index={index + 1}
                order={order}
                onEdit={handleEdit}
                onDelete={() => handleDelete(order._id)}
                onRefund={() => handleRefund(order)}
                isAdmin={isAdmin}
              />
            ))
          )}
        </tbody>
      </table>
      </div>

      <OrderModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
        }}
        order={editingOrder}
        onSuccess={fetchOrders}
        existingOrderIds={(orders || []).map((o) => o.orderId || "").filter(Boolean)}
      />

      <Modal open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <h3 className="text-lg font-bold mb-2">Delete Order</h3>
        <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this order?</p>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 rounded bg-gray-200" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>

      <Modal open={Boolean(refundOrder)} onClose={() => setRefundOrder(null)}>
        <h3 className="text-lg font-bold mb-2">Refund Amount</h3>
        <input
          className="w-full border p-2 rounded mb-3"
          type="number"
          step="0.01"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 rounded bg-gray-200" onClick={() => setRefundOrder(null)}>Cancel</button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white cursor-pointer" onClick={confirmRefund}>Save</button>
        </div>
      </Modal>
    </>
  );
}
