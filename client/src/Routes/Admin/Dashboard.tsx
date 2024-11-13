import React, { useEffect, useState } from "react";
import "./Dashboard.scss";
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
		<>
			<div className="dashboard-container">
				{/* <div className="dashboard-header">
					<h2>Welcome to Instamine Admin</h2>
					<p>Here's your business overview at a glance.</p>
				</div> */}

				<div className="dashboard-content">
					<div className="dashboard-overview">
						<div className="card-test total-sales">
							<div className="card-content">
								<h3>Total Sales</h3>
								<p>₱ {totalSales}</p>
							</div>
							<div className="card-icon">
								<i className="fa fa-dollar-sign"></i>
							</div>
						</div>
						<div className="card-test total-users">
							<div className="card-content">
								<h3>Total Users</h3>
								<p>{userCount}</p>
							</div>
							<div className="card-icon">
								<i className="fa fa-users"></i>
							</div>
						</div>
						<div className="card-test total-products">
							<div className="card-content">
								<h3>Total Products</h3>
								<p>{productCount}</p>
							</div>
							<div className="card-icon">
								<i className="fa fa-cogs"></i>
							</div>
						</div>
						<div className="card-test total-orders">
							<div className="card-content">
								<h3>Total Orders</h3>
								<p>{totalOrders}</p>
							</div>
							<div className="card-icon">
								<i className="fa fa-box"></i>
							</div>
						</div>
					</div>

					<div className="dashboard-charts">
						<div className="chart-card">
							<h3>Sales Over Time</h3>
							<div className="chart-placeholder">
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
															parseFloat(
																data.revenue
															)
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
														(data) =>
															data.totalSales
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
									<p>No sales data available</p>
								)}
							</div>
						</div>

						{/* <div className="chart-card">
							<h3>Top Products</h3>
							<div className="chart-placeholder">
								[Chart Placeholder]
							</div>
						</div> */}
						<TopProductsChart topProducts={topProducts} />
					</div>

					{/* <div className="recent-activity">
						<h3>Recent Activity</h3>
						<ul>
							<li>
								User <b>John Doe</b> placed an order for{" "}
								<b>3 items</b>
							</li>
							<li>
								Product <b>"Pink T-Shirt"</b> was added to
								inventory
							</li>
							<li>
								User <b>Jane Smith</b> registered
							</li>
							<li>Order #1234 was marked as shipped</li>
						</ul>
					</div> */}
				</div>
			</div>
		</>
	);
}
