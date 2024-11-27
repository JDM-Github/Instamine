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
	const [topProducts, setTopProducts] = useState([]);
	const [salesOverTime, setSalesOverTime] = useState([]);
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
		<div
			className="absolute px-6 py-8 bg-gray-100 top-[60px] left-[320px] absolute"
			style={{ width: "calc(100vw - 330px)" }}
		>
			<div className="dashboard-content grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Overview Section */}
				<div className="dashboard-overview grid grid-cols-2 gap-6">
					<div className="card bg-pink-100 shadow-md rounded-lg p-6 flex justify-between items-center">
						<div>
							<h3 className="text-lg font-semibold text-pink-600">
								Total Sales
							</h3>
							<p className="text-2xl font-bold text-gray-800 text-center">
								₱ {totalSales}
							</p>
						</div>
						<div className="text-pink-500 text-4xl">
							<i className="fa fa-dollar-sign"></i>
						</div>
					</div>

					<div className="card bg-pink-100 shadow-md rounded-lg p-6 flex justify-between items-center">
						<div>
							<h3 className="text-lg font-semibold text-pink-600">
								Total Users
							</h3>
							<p className="text-2xl font-bold text-gray-800 text-center">
								{userCount}
							</p>
						</div>
						<div className="text-pink-500 text-4xl">
							<i className="fa fa-users"></i>
						</div>
					</div>

					<div className="card bg-pink-100 shadow-md rounded-lg p-6 flex justify-between items-center">
						<div>
							<h3 className="text-lg font-semibold text-pink-600">
								Total Products
							</h3>
							<p className="text-2xl font-bold text-gray-800 text-center">
								{productCount}
							</p>
						</div>
						<div className="text-pink-500 text-4xl">
							<i className="fa fa-cogs"></i>
						</div>
					</div>

					<div className="card bg-pink-100 shadow-md rounded-lg p-6 flex justify-between items-center">
						<div>
							<h3 className="text-lg font-semibold text-pink-600">
								Total Orders
							</h3>
							<p className="text-2xl font-bold text-gray-800 text-center">
								{totalOrders}
							</p>
						</div>
						<div className="text-pink-500 text-4xl">
							<i className="fa fa-box"></i>
						</div>
					</div>
				</div>

				{/* Charts Section */}
				<div className="dashboard-charts space-y-6">
					<div className="chart-card bg-white shadow-md rounded-lg p-6">
						<h3 className="text-lg font-semibold text-pink-600 mb-4">
							Sales Over Time
						</h3>
						<div className="chart-placeholder h-72">
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
					<TopProductsChart topProducts={topProducts} />
				</div>
			</div>
		</div>
	);
}
