import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

// Register the components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

export default function TopProductsChart({ topProducts }) {
	const [chartData, setChartData] = useState(null);

	// const sampleTopProducts = [
	// 	{ name: "Pink T-Shirt", count: 50 },
	// 	{ name: "Blue Jeans", count: 35 },
	// 	{ name: "Black Sneakers", count: 20 },
	// 	{ name: "White Hoodie", count: 25 },
	// 	{ name: "Red Cap", count: 15 },
	// ];

	useEffect(() => {
		if (topProducts && topProducts.length > 0) {
			const labels = topProducts.map((product) => product.name);
			const data = topProducts.map((product) => product.count);

			setChartData({
				labels,
				datasets: [
					{
						label: "Order Count",
						data,
						backgroundColor: "#FF69B4",
						borderColor: "#FF1493",
						borderWidth: 1,
					},
				],
			});
		}
	}, [topProducts]);

	if (!chartData)
		return (
			<div className="chart-card">
				<h3>Top Products</h3>
				<div className="chart-placeholder">No Top Products.</div>
			</div>
		);

	return (
		<div className="chart-card">
			<h3>Top Products</h3>
			<div className="chart-placeholder">
				<Bar
					data={chartData}
					options={{
						responsive: true,
						plugins: {
							legend: { display: false },
							tooltip: {
								callbacks: {
									label: (tooltipItem) =>
										`Orders: ${tooltipItem.raw}`,
								},
							},
						},
						scales: {
							y: { beginAtZero: true },
						},
					}}
				/>
			</div>
		</div>
	);
}
