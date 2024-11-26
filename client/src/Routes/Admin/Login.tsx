import React, { useState } from "react";

const Login = ({ onLogin }) => {
	const [secretKey, setSecretKey] = useState("");
	const [error, setError] = useState("");

	const handleLogin = () => {
		const adminSecretKey = "instamine";
		if (secretKey === adminSecretKey) {
			onLogin();
		} else {
			setError("Invalid Secret Key!");
		}
	};

	return (
		<div style={styles.loginContainer}>
			<h2 style={styles.title}>Admin Login</h2>
			<input
				type="password"
				placeholder="Enter Secret Key"
				value={secretKey}
				onChange={(e) => setSecretKey(e.target.value)}
				style={styles.input}
			/>
			<button onClick={handleLogin} style={styles.button}>
				Login
			</button>
			{error && <p style={styles.error}>{error}</p>}
		</div>
	);
};

const styles = {
	loginContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		height: "100vh",
		backgroundColor: "#f8f9fa",
	},
	title: { fontSize: "24px", marginBottom: "20px" },
	input: {
		width: "300px",
		padding: "10px",
		marginBottom: "10px",
		border: "1px solid #ddd",
		borderRadius: "5px",
	},
	button: {
		padding: "10px 20px",
		backgroundColor: "#007bff",
		color: "white",
		border: "none",
		borderRadius: "5px",
		cursor: "pointer",
	},
	error: { color: "red", marginTop: "10px" },
};

export default Login;
