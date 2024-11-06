import React, { useEffect, useState } from "react";
import "./Subscription.scss";
import { useNavigate } from "react-router-dom";

const renderPlanButton = (membership, targetPlan, label) => {
	const isDisabled =
		(membership === "NORMAL" && targetPlan !== "GOLD") ||
		(membership === "GOLD" && targetPlan !== "DIAMOND");

	return (
		<button className="select-btn" disabled={isDisabled}>
			{isDisabled ? "Unavailable" : label}
		</button>
	);
};

export default function SubscriptionModal({ onClose }) {

	const navigate = useNavigate();
	useEffect(() => {
		if (localStorage.getItem("users") === null) {
			sessionStorage.setItem("error-message", "Invalid User Token");
			navigate("/");
		}
		sessionStorage.removeItem("error-message");
	}, []);
	const user = JSON.parse(localStorage.getItem("users") || "{}");

	return (
		<div className="modal-overlay">
			<button className="close-btn" onClick={onClose}>
				&times;
			</button>
			<div className="modal">
				<div className="modal-content">
					<div className="plan normal-plan">
						<h3>NORMAL</h3>
						<p>Browse services but no access privileges.</p>
						<span className="price">FREE</span>
					</div>

					<div className="plan gold-plan">
						<h3>GOLD</h3>
						<p>Full access for a limited period of 30 days.</p>
						<span className="price">$9.99 / month</span>
						{renderPlanButton(user.membership, "GOLD", "Select")}
					</div>

					<div className="plan diamond-plan">
						<h3>DIAMOND</h3>
						<p>Full access for 365 days.</p>
						<span className="price">$29.99 / month</span>
						<button className="select-btn">Select</button>
					</div>
				</div>
			</div>
		</div>
	);
};

