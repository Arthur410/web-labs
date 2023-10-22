import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { IStock } from '../../interfaces/IStock';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function LineChart({ chartData }: { chartData: IStock }) {
  const labels = chartData.historicalData.map((dataPoint) => dataPoint.date);
  const dataPoints = chartData.historicalData.map((dataPoint) =>
    parseFloat(dataPoint.price.replace('$', '')) // Parse the price as a float
  );

  const options = {
    responsive: true,

    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Статистика изменения курса ' + chartData.name,
      },
      scales: {
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Цена акции',
        data: dataPoints,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return <Line options={options} data={data} />;
}
