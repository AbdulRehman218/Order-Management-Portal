export default function StatCard({ title, value, color = "blue" }) {
  const palette = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
    green: { bg: "bg-green-50", text: "text-green-600", ring: "ring-green-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
    gray: { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-100" },
    teal: { bg: "bg-teal-50", text: "text-teal-600", ring: "ring-teal-100" },
    pink: { bg: "bg-pink-50", text: "text-pink-600", ring: "ring-pink-100" },
    red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", ring: "ring-cyan-100" },
  }[color] || { bg: "bg-gray-50", text: "text-gray-700", ring: "ring-gray-100" };
  return (
    <div className={`bg-white p-4 rounded shadow border border-gray-100`}>
      <div className={`inline-block px-2 py-1 rounded ${palette.bg} ${palette.text} text-xs font-semibold mb-2`}>
        {title}
      </div>
      <h3 className={`text-2xl font-extrabold ${palette.text}`}>{value}</h3>
    </div>
  );
}
