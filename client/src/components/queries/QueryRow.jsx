export default function QueryRow({ query, onDelete, onShow, onEdit, canDelete }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-600";
      case "notresolved":
        return "bg-red-100 text-red-600";
      case "inprogress":
        return "bg-yellow-100 text-yellow-600";
      case "follow":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatStatus = (status) => {
    if (!status) return "In Progress";
    return status
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRemainingTime = (dateString) => {
    if (!dateString) return "-";
    const now = new Date();
    const expiry = new Date(dateString);
    const diff = expiry - now;
    
    if (diff <= 0) return <span className="text-red-600 font-semibold">Expired</span>;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <tr className="border-t">
      <td className="p-2">{query.orderId || "-"}</td>
      <td className="p-2">{query.details || "-"}</td>
      <td className="p-2">{query.handlerName || "-"}</td>
      <td className="p-2">
        <span className={`px-2 py-1 rounded-full ${getStatusColor(query.status)}`}>
          {formatStatus(query.status)}
        </span>
      </td>
      <td className="p-2">{getRemainingTime(query.expiresAt)}</td>
      <td className="p-2">{formatDate(query.createdAt)}</td>
      <td className="p-2">
        <button
          className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 mr-2 cursor-pointer"
          onClick={() => onShow(query)}
        >
          Show
        </button>
        <button
          className="px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 mr-2 cursor-pointer"
          onClick={() => onEdit(query)}
        >
          Edit
        </button>
        {canDelete && (
          <button
            className="px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            onClick={() => onDelete(query._id)}
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
