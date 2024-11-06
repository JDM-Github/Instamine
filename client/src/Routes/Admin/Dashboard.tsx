import React, { useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaDollarSign, FaUsers, FaStore } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
	const chartRef = useRef<ChartJS>(null);
	const pieOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "bottom" as const, // Explicitly set the position type
			},
		},
	};

	const pieData = {
		labels: ["Revenue", "Users", "Sellers"],
		datasets: [
			{
				label: "Analytics Overview",
				data: [12300, 1250, 500],
				backgroundColor: ["#ff69b4", "#ffb6c1", "#ff85a2"],
				hoverOffset: 4,
			},
		],
	};

	return <Pie ref={chartRef} data={pieData} options={pieOptions} />;
};

const Dashboard = () => {
	const pieData = {
		labels: ["Revenue", "Users", "Sellers"],
		datasets: [
			{
				label: "Analytics Overview",
				data: [12300, 1250, 500],
				backgroundColor: ["#ff69b4", "#ffb6c1", "#ff85a2"],
				hoverOffset: 4,
			},
		],
	};

	return (
		<div className="container mt-5">
			<h2
				className="text-center mb-4"
				style={{ color: "#ff69b4", fontWeight: "bold" }}
			>
				Instamine Dashboard
			</h2>

			{/* Top Analytics Cards */}
			<div className="row mb-4">
				{/* Revenue Card */}
				<div className="col-md-4 mb-4">
					<div
						className="card shadow-sm"
						style={{
							borderRadius: "15px",
							backgroundColor: "#ffb6c1",
							color: "#fff",
							textAlign: "center",
						}}
					>
						<div className="card-body d-flex flex-column align-items-center">
							{/* <FaDollarSign size={32} style={iconStyle} /> */}
							<h5 className="card-title mt-3" style={titleStyle}>
								Revenue
							</h5>
							<h3 className="card-text" style={valueStyle}>
								$12,300
							</h3>
						</div>
					</div>
				</div>

				{/* Users Card */}
				<div className="col-md-4 mb-4">
					<div
						className="card shadow-sm"
						style={{
							borderRadius: "15px",
							backgroundColor: "#ffb6c1",
							color: "#fff",
							textAlign: "center",
						}}
					>
						<div className="card-body d-flex flex-column align-items-center">
							{/* <FaUsers size={32} style={iconStyle} /> */}
							<h5 className="card-title mt-3" style={titleStyle}>
								Total Users
							</h5>
							<h3 className="card-text" style={valueStyle}>
								1,250
							</h3>
						</div>
					</div>
				</div>

				{/* Sellers Card */}
				<div className="col-md-4 mb-4">
					<div
						className="card shadow-sm"
						style={{
							borderRadius: "15px",
							backgroundColor: "#ffb6c1",
							color: "#fff",
							textAlign: "center",
						}}
					>
						<div className="card-body d-flex flex-column align-items-center">
							{/* <FaStore size={32} style={iconStyle} /> */}
							<h5 className="card-title mt-3" style={titleStyle}>
								Total Sellers
							</h5>
							<h3 className="card-text" style={valueStyle}>
								500
							</h3>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const iconStyle = {
	color: "#ff69b4",
};

const titleStyle = {
	fontSize: "1.1rem",
	fontWeight: "500",
};

const valueStyle = {
	fontSize: "1.8rem",
	fontWeight: "bold",
};

export default Dashboard;
