import React, { useEffect, useState } from "react";
// import "./Dashboard.scss";
import RequestHandler from "../../Functions/RequestHandler";
import { toast, ToastContainer } from "react-toastify";
import TopProductsChart from "../../Component/TopProductChart.tsx";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

export default function Dashboard() {
	const [totalOrders, setTotalOrders] = useState(0);
	const [topProducts, setTopProducts] = useState<any>([]);
	const [salesOverTime, setSalesOverTime] = useState<any>([]);
	const [totalSales, setTotalSales] = useState(0);
	const [userCount, setUserCount] = useState(0);
	const [productCount, setProductCount] = useState(0);

	const loadRequestData = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"orders/getAllOrderRevenue"
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				setTotalOrders(data.totalOrders);
				setTotalSales(data.totalRevenue);
				setTopProducts(data.topProducts);
				setUserCount(data.userCount);
				setSalesOverTime(data.salesOverTime);
				setProductCount(data.productCount);
			}
		} catch (error) {
			toast.error(`An error occurred while requesting data. ${error}`);
		}
	};
	useEffect(() => {
		loadRequestData();
	}, []);

	return (
		<div className="absolute bg-gray-50 top-[60px] left-[320px] w-[calc(100vw-330px)] p-6">
			<div className="dashboard-content space-y-8">
				{/* Cards Section */}
				<div className="dashboard-overview grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					<div className="card bg-pink-50 shadow-xl rounded-lg p-6 flex flex-col justify-between items-start">
						<h3 className="text-lg font-semibold text-pink-600 mb-2">
							Total Sales
						</h3>
						<p className="text-4xl font-bold text-gray-800">
							₱ {totalSales}
						</p>
						<div className="text-pink-500 text-5xl mt-4">
							<i className="fa fa-dollar-sign"></i>
						</div>
					</div>

					<div className="card bg-pink-50 shadow-xl rounded-lg p-6 flex flex-col justify-between items-start">
						<h3 className="text-lg font-semibold text-pink-600 mb-2">
							Total Users
						</h3>
						<p className="text-4xl font-bold text-gray-800">
							{userCount}
						</p>
						<div className="text-pink-500 text-5xl mt-4">
							<i className="fa fa-users"></i>
						</div>
					</div>

					<div className="card bg-pink-50 shadow-xl rounded-lg p-6 flex flex-col justify-between items-start">
						<h3 className="text-lg font-semibold text-pink-600 mb-2">
							Total Products
						</h3>
						<p className="text-4xl font-bold text-gray-800">
							{productCount}
						</p>
						<div className="text-pink-500 text-5xl mt-4">
							<i className="fa fa-cogs"></i>
						</div>
					</div>

					<div className="card bg-pink-50 shadow-xl rounded-lg p-6 flex flex-col justify-between items-start">
						<h3 className="text-lg font-semibold text-pink-600 mb-2">
							Total Orders
						</h3>
						<p className="text-4xl font-bold text-gray-800">
							{totalOrders}
						</p>
						<div className="text-pink-500 text-5xl mt-4">
							<i className="fa fa-box"></i>
						</div>
					</div>
				</div>

				{/* Analytics Section */}
				<div className="dashboard-charts grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Sales Over Time Chart */}
					<div className="chart-card bg-white shadow-xl rounded-lg p-6 space-y-4">
						<h3 className="text-lg font-semibold text-pink-600">
							Sales Over Time
						</h3>
						<div className="chart-placeholder h-[350px]">
							{salesOverTime && salesOverTime.length > 0 ? (
								<Line
									data={{
										labels: salesOverTime.map(
											(data) => data.month
										),
										datasets: [
											{
												label: "Revenue ($)",
												data: salesOverTime.map(
													(data) =>
														parseFloat(data.revenue)
												),
												borderColor: "#ff6384",
												backgroundColor:
													"rgba(255, 99, 132, 0.5)",
												fill: true,
												tension: 0.4,
											},
											{
												label: "Total Sales",
												data: salesOverTime.map(
													(data) => data.totalSales
												),
												borderColor: "#36a2eb",
												backgroundColor:
													"rgba(54, 162, 235, 0.5)",
												fill: true,
												tension: 0.4,
											},
										],
									}}
									options={{
										responsive: true,
										scales: {
											x: {
												title: {
													display: true,
													text: "Month",
												},
											},
											y: {
												title: {
													display: true,
													text: "Amount",
												},
											},
										},
										plugins: {
											tooltip: {
												mode: "index",
												intersect: false,
											},
											legend: {
												display: true,
												position: "top",
											},
										},
									}}
								/>
							) : (
								<p className="text-gray-500">
									No sales data available
								</p>
							)}
						</div>
					</div>

					{/* Top Products Chart */}
					<div className="chart-card bg-white shadow-xl rounded-lg p-6 space-y-4">
						<h3 className="text-lg font-semibold text-pink-600">
							Top Products
						</h3>
						<TopProductsChart topProducts={topProducts} />
					</div>
				</div>
			</div>
		</div>
	);


}
