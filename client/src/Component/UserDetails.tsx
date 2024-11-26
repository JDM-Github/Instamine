import React from "react";
import "./UserDetails.scss";

const UserDetailsModal = ({ isOpen, onClose, order }) => {
	if (!isOpen || !order) return null;

	const id = order.id;
	const fullName = order.firstName + " " + order.lastName;
	const email = order.email;
	const phoneNum = order.phoneNumber;
	const location = order.location;

	return (
		<div className="user-details-overlay">
			<div className="user-modal-content">
				<div className="modal-header">
					<h3>User Details</h3>
					<button className="close-btn" onClick={onClose}>
						&times;
					</button>
				</div>

				<div className="modal-body">
					<div className="order-info">
						<div className="info-group">
							<label>User ID:</label>
							<span>{id}</span>
						</div>
						<div className="info-group">
							<label>Full Name:</label>
							<span>{fullName}</span>
						</div>
						<div className="info-group">
							<label>Email:</label>
							<span>{email}</span>
						</div>
						<div className="info-group">
							<label>Phone Number:</label>
							<span>{phoneNum}</span>
						</div>
						<div className="info-group">
							<label>Location:</label>
							<span>{location}</span>
						</div>
					</div>
				</div>

				<div className="modal-footer">
					<button className="close-btn" onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default UserDetailsModal;
