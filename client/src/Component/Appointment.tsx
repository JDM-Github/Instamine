import React, { useState } from "react";
import "./SCSS/Modal.scss";

export default function AppointmentModal({
	onClose,
	onCreate,
	onCancel,
	appointmentData,
	setAppointmentData,
}) {
	const handleChange = (e) => {
		const { name, value } = e.target;
		setAppointmentData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<div className="appointment-modal-overlay">
			<div className="modal-content">
				<button className="close-button" onClick={onClose}>
					&times;
				</button>
				<h2 className="form-title">APPOINTMENT DETAILS</h2>
				<div className="appointment-details">
					<label>
						<strong>Date:</strong>
					</label>
					<input
						type="date"
						name="date"
						value={appointmentData.date}
						onChange={handleChange}
						min={new Date().toISOString().split("T")[0]}
					/>
					<label>
						<strong>Meeting with:</strong>
					</label>
					<input
						type="text"
						name="people"
						placeholder="Enter names"
						value={appointmentData.people}
						onChange={handleChange}
					/>
					<label>
						<strong>Additional Notes:</strong>
					</label>
					<textarea
						name="notes"
						placeholder="Enter any additional notes"
						value={appointmentData.notes}
						onChange={handleChange}
						className="notes"
					/>
				</div>
				<div className="modal-actions">
					<button
						onClick={() => onCreate(appointmentData)}
						className="create-btn"
					>
						Create Appointment
					</button>
					<button onClick={onCancel} className="cancel-btn">
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
