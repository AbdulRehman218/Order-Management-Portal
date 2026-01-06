import { useState } from "react";
import api from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function QueryForm({ onSuccess }) {
  const [searchParams] = useSearchParams();
  const accountRef = searchParams.get("account") || "";
  const viewUserParam = searchParams.get("user") || "";
  const [formData, setFormData] = useState({
    orderId: "",
    status: "inprogress",
    message: "",
    answer: "",
    handlerName: "",
    expiresAt: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { handlers } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post(
        "/queries",
        { 
          ...formData, 
          accountRef,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
        },
        { params: viewUserParam ? { user: viewUserParam } : undefined }
      );
      setSuccess("Query added successfully!");
      setFormData({
        orderId: "",
        status: "inprogress",
        message: "",
        answer: "",
        handlerName: ""
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow border border-gray-100">
      <h2 className="font-bold mb-4 text-gray-800">Add Query</h2>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-2 bg-green-100 text-green-600 rounded text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Order ID"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            required
            className="focus:ring-primary focus:border-primary"
          />
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="inprogress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="notresolved">Not Resolved</option>
              <option value="follow">Follow</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Handler</label>
            <select
              className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.handlerName}
              onChange={(e) => setFormData({ ...formData, handlerName: e.target.value })}
            >
              <option value="">Select Handler</option>
              {handlers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Expires At</label>
            <Input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <textarea
          className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Query Message / Details"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
        <textarea
          className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Answer (Optional)"
          rows={3}
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
        />

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-primary hover:brightness-90 text-white"
        >
          {loading ? "Adding..." : "Add Query"}
        </Button>
      </form>
    </div>
  );
}
