import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.scss";

export default function Navigation() {
	return (
		<div className="admin-navigation">
			<input className="nav-input" placeholder="Search..." />
			<div className="nav-items" data-label="DASHBOARD">
				<Link to="/">
					<div>DASHBOARD</div>
				</Link>
			</div>
			<div className="nav-items" data-label="USERS">
				<Link to="/users">
					<div>USERS</div>
				</Link>
			</div>
			<div className="nav-items" data-label="LOGIN">
				<Link to="/login">
					<div>LOGIN</div>
				</Link>
			</div>
		</div>
	);
}
