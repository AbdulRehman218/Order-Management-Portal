import { useState, useEffect } from "react";
import api from "../../services/api";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";


export default function OrderModal({ open, onClose, order, onSuccess, existingOrderIds = [] }) {
  const [searchParams] = useSearchParams();
  const accountRef = searchParams.get("account") || "";
  const viewUserParam = searchParams.get("user") || "";
  const { handlers } = useTheme();
 
  const [formData, setFormData] = useState({
    orderId: "",
    sku: "",
    details: "",
    aliExpressOrder: "",
    notes: "",
    trackingId: "",
    buyPrice: "",
    sellPrice: "",
    refundAmount: "",
    status: "pending",
    handlerName: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) {
      setFormData({
        orderId: order.orderId || "",
        sku: order.sku || "",
        details: order.details || "",
        aliExpressOrder: order.aliExpressOrder || "",
        notes: order.notes || "",
        trackingId: order.trackingId || "",
        buyPrice: order.buyPrice || "",
        sellPrice: order.sellPrice || "",
        refundAmount: order.refundAmount || "",
        status: order.status || "pending",
        handlerName: order.handlerName || ""
      });
    } else {
      setFormData({
        orderId: "",
        sku: "",
        details: "",
        aliExpressOrder: "",
        notes: "",
        trackingId: "",
        buyPrice: "",
        sellPrice: "",
        refundAmount: "",
        status: "pending",
        handlerName: ""
      });
    }
    setError("");
  }, [order, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!order) {
        const id = (formData.orderId || "").trim();
        // Exact match check
        const exists = existingOrderIds.some(existingId => {
          const eId = (existingId || "").trim();
          // Strict case-insensitive match
          return eId.toLowerCase() === id.toLowerCase();
        });

        if (id && exists) {
          setError(`Order ID "${id}" already exists.`);
          setLoading(false);
          return;
        }
      }
      const basePayload = {
        ...formData,
        accountRef,
        buyPrice: parseFloat(formData.buyPrice),
        sellPrice: parseFloat(formData.sellPrice),
        refundAmount: parseFloat(formData.refundAmount) || 0
      };
      if (order) {
        const updatePayload = { ...basePayload };
        delete updatePayload.handlerName;
        await api.put(
          `/orders/${order._id}`,
          updatePayload,
          { params: viewUserParam ? { user: viewUserParam } : undefined }
        );
      } else {
        await api.post(
          "/orders",
          basePayload,
          { params: viewUserParam ? { user: viewUserParam } : undefined }
        );
      }
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        {order ? "Edit Order" : "Add New Order"}
      </h2>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-0.5">Order ID</label>
            <Input
              placeholder="e.g. #12345"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              className="focus:ring-primary focus:border-primary"
              required={!order}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-0.5">SKU</label>
            <Input
              placeholder="e.g. ABC-001"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-0.5">Details</label>
            <Input
              placeholder="Order details (optional)"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
            <Input
              placeholder="Internal notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          {!order && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Handler</label>
              <select
                className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.handlerName}
                onChange={(e) => setFormData({ ...formData, handlerName: e.target.value })}
              >
                <option value="">Select handler</option>
                {handlers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Assigned person for this order</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">AliExpress ID</label>
            <Input
              placeholder="AliExpress order (optional)"
              value={formData.aliExpressOrder}
              onChange={(e) => setFormData({ ...formData, aliExpressOrder: e.target.value })}
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-0.5">Tracking ID</label>
            <Input
              placeholder="Tracking ID (optional)"
              value={formData.trackingId}
              onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Buy Price</label>
            <Input
              placeholder="0.00"
              type="number"
              step="0.01"
              value={formData.buyPrice}
              onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
              required
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sell Price</label>
            <Input
              placeholder="0.00"
              type="number"
              step="0.01"
              value={formData.sellPrice}
              onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
              required
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Refund Amount</label>
            <Input
              placeholder="0.00 (optional)"
              type="number"
              step="0.01"
              value={formData.refundAmount}
              onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
              className="focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <Button type="submit" className="mt-3 w-full" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </form>
    </Modal>
  );
}
