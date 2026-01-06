import { useTheme } from "../../context/ThemeContext";

export default function OrderRow({ order, index, onEdit, onDelete, onRefund, isAdmin }) {
  const { currency } = useTheme();

  const getStatusColor = (status) => {
    if (typeof status !== 'string') return "bg-gray-100 text-gray-600";
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "processing":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <tr className="border-t hover:bg-gray-50 transition-colors">
      <td className="px-1 py-3 font-bold text-gray-500 whitespace-nowrap">{index}</td>
      <td className="px-1 py-3 whitespace-nowrap max-w-[110px] truncate" title={order.orderId}>{order.orderId || order._id?.slice(-6)}</td>
      <td className="px-1 py-3 whitespace-nowrap max-w-[120px] truncate" title={order.sku}>{order.sku || "-"}</td>
      <td className="px-1 py-3 whitespace-normal break-words max-w-[180px] leading-tight">{order.details || "-"}</td>
      <td className="px-1 py-3 whitespace-normal break-words max-w-[130px] leading-tight">{order.processId || order.aliExpressOrder || "-"}</td>
      <td className="px-1 py-3 whitespace-normal break-words max-w-[140px] leading-tight">{order.trackingId || "-"}</td>
      <td className="px-1 py-3 whitespace-normal break-words max-w-[110px] leading-tight">{order.notes || "-"}</td>
      <td className="px-1 py-3 whitespace-nowrap max-w-[80px] truncate">{order.handlerName || "-"}</td>
      <td className="px-1 py-3 whitespace-nowrap">{currency}{order.buyPrice?.toFixed(2) || "0.00"}</td>
      <td className="px-1 py-3 whitespace-nowrap">{currency}{order.sellPrice?.toFixed(2) || "0.00"}</td>
      <td className="px-1 py-3 whitespace-nowrap">{currency}{order.netProfit?.toFixed(2) || "0.00"}</td>
      <td className="px-1 py-3">
        <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
          {order.status || "pending"}
        </span>
      </td>
      <td className="px-1 py-3 text-sm text-gray-600 whitespace-nowrap">
        {new Date(order.createdAt).toLocaleDateString()}
        <div className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</div>
      </td>
      <td className="px-1 py-3 space-x-2 flex items-center justify-center">
        <button 
          onClick={() => onEdit(order)} 
          className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs hover:bg-blue-200 cursor-pointer"
        >
          Edit
        </button>
        <button 
          onClick={onRefund} 
          className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs hover:bg-yellow-200 cursor-pointer"
        >
          Refund
        </button>
        <button 
          onClick={onDelete} 
          className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs hover:bg-red-200 cursor-pointer"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
