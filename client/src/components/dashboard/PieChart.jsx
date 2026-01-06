import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ labels = [], values = [], colors = [] }) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.length ? colors : ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"],
        borderWidth: 0
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || "";
            const value = ctx.raw ?? 0;
            return `${label}: ${Number(value).toLocaleString()}`;
          }
        }
      }
    },
    cutout: "60%"
  };
  return (
    <div className="w-full max-w-lg mx-auto">
      <Doughnut data={data} options={options} />
    </div>
  );
}
