import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard.tsx";
import Navigation from "./Navigation.tsx";

import "./AdminRoute.scss";
import AdminLogin from "./LoginPage.tsx";
import Users from "./Users.tsx";

export default function AdminRoute({ className }) {
	return (
		<div className="admin">
			<Navigation />
			<div className="admin-content">
				<Routes>
					<Route index path="/" element={<Dashboard />} />
					<Route index path="/login" element={<AdminLogin />} />
					<Route index path="/users" element={<Users />} />
				</Routes>
			</div>
		</div>
	);
}
