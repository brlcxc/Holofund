import React, { useContext, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { TransactionContext } from "../context/TransactionContext";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; // Import ChartJS first

import annotationPlugin from 'chartjs-plugin-annotation'; // Annotation plugin

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  annotationPlugin // Ensure annotation plugin is registered
);
// import annotationPlugin from 'chartjs-plugin-annotation';

// Register the Chart.js components and annotation plugin
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const TransactionLineChart = ({ mergeData = [] }) => {
  const { transactions } = useContext(TransactionContext);

  // Combine transactions and mergeData, then format the data
  const chartData = useMemo(() => {
    const formattedMergeData = mergeData.map((item) => ({
      ...item,
      start_date: item.date,
      amount: parseFloat(item.amount) || 0,
    }));

    const combinedTransactions = [...transactions, ...formattedMergeData];

    // Sort by date for chronological order
    combinedTransactions.sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );

    // Filter for positive and negative transactions
    const positiveTransactions = combinedTransactions.map((transaction) =>
      transaction.amount >= 0 ? transaction.amount : null
    );
    const negativeTransactions = combinedTransactions.map((transaction) =>
      transaction.amount < 0 ? transaction.amount : null
    );

    let cumulativePositiveSum = 0;
    let cumulativeNegativeSum = 0;

    const cumulativePositiveAmounts = [];
    const cumulativeNegativeAmounts = [];

    combinedTransactions.forEach((transaction) => {
      // console.log(transaction.amount)
      if (transaction.amount >= 0) {
        console.log("pos" + transaction.amount)
        let test = parseFloat(transaction.amount)
        cumulativePositiveSum += test;
        cumulativePositiveAmounts.push(cumulativePositiveSum);
        cumulativeNegativeAmounts.push(cumulativeNegativeSum); // Keep negative sum unchanged
      } else {
        // console.log("neg" + transaction.amount)
        cumulativeNegativeSum += transaction.amount * -1;
        cumulativeNegativeAmounts.push(cumulativeNegativeSum);
        cumulativePositiveAmounts.push(cumulativePositiveSum); // Keep positive sum unchanged
      }
    });

    // console.log(cumulativePositiveAmounts)
    // console.log(cumulativeNegativeAmounts)

    return {
      labels: combinedTransactions.map((transaction) =>
        transaction.start_date
          ? new Date(transaction.start_date).toLocaleDateString()
          : "N/A"
      ),
      datasets: [
        {
          label: "Income",
          data: cumulativePositiveAmounts ,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
          spanGaps: true, // Avoid drawing lines between null points
        },
        {
          label: "Spending",
          data: cumulativeNegativeAmounts,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
          spanGaps: true,
        },
      ],
    };
  }, [transactions, mergeData]);

  // Chart options with annotation
  const options = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Amount" } },
    },
    plugins: {
      legend: { display: true, position: "top" },
      annotation: {
        annotations: {
          todayLine: {
            type: 'line',
            xMin: new Date().toLocaleDateString(),
            xMax: new Date().toLocaleDateString(),
            borderColor: 'rgba(0, 0, 0, 0.5)',
            borderWidth: 2,
            label: {
              content: 'Today',
              enabled: true,
              position: 'top',
            },
          },
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-black">Anticipated Trend</h1>
      <div className="flex items-center justify-center h-[480px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TransactionLineChart;

//Maybe I should just have it start at 0 and then go above and blow

//it is possible that the data isnt transfering well