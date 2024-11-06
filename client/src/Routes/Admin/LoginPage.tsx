import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminLogin = () => {
	return (
		<div
			className="d-flex justify-content-center align-items-center"
			style={{ width: "100%", height: "100%", marginTop: "-50px" }}
		>
			<div
				className="card p-4"
				style={{
					width: "350px",
					backgroundColor: "#ffffff",
					borderRadius: "15px",
					boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
				}}
			>
				<h2 className="text-center mb-4" style={{ color: "#ff69b4" }}>
					ADMIN LOGIN
				</h2>
				<form>
					<div className="form-group mb-3">
						<label style={{ color: "#ff69b4" }}>Username</label>
						<input
							type="text"
							className="form-control"
							placeholder="Enter your username"
						/>
					</div>
					<div className="form-group mb-4">
						<label style={{ color: "#ff69b4" }}>Password</label>
						<input
							type="password"
							className="form-control"
							placeholder="Enter your password"
						/>
					</div>
					<button
						type="submit"
						className="btn btn-primary btn-block"
						style={{
							backgroundColor: "#ff69b4",
							borderColor: "#ff69b4",
						}}
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
};

export default AdminLogin;
