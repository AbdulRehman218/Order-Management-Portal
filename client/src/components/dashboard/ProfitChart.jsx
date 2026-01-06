import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function ProfitChart({ data = [] }) {
  // Calculate cumulative data for the "Cash Balance" line trend
  let cumulative = 0;
  const lineData = data.map(item => {
    cumulative += (item.profit || 0);
    return cumulative;
  });

  const barData = data.map(item => item.profit || 0);
  const labels = data.length > 0 ? data.map((item) => `Day ${item._id}`) : ["No data"];

  const chartData = {
    labels,
    datasets: [
      {
        type: 'line',
        label: 'Balance Trend',
        data: lineData,
        borderColor: '#1f2937', // Dark gray line
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#1f2937',
        yAxisID: 'y1'
      },
      {
        type: 'bar',
        label: 'Net Profit',
        data: barData,
        backgroundColor: barData.map(val => val >= 0 ? '#3b82f6' : '#f97316'), // Blue for +, Orange for -
        borderRadius: 4,
        yAxisID: 'y'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Company Financial Analysis',
        font: {
          size: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Net Profit'
        },
        grid: {
          display: false
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Balance Trend'
        },
        grid: {
          drawOnChartArea: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Chart type='bar' data={chartData} options={options} />
    </div>
  );
}
