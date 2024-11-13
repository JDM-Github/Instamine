import React from "react";
import "./OrderDetails.scss";

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
	if (!isOpen || !order) return null;

	const {
		id,
		Product: { name: productName, price: productPrice },
		numberOfProduct,
		Customer: { firstName, lastName, email },
		createdAt,
	} = order;

	const totalPrice = numberOfProduct * productPrice;

	return (
		<div className="order-details-modal">
			<div className="modal-content">
				<div className="modal-header">
					<h2>Order Details</h2>
					<button className="close-btn" onClick={onClose}>
						&times;
					</button>
				</div>

				<div className="modal-body">
					<div className="order-info">
						<div className="info-group">
							<label>Order ID:</label>
							<span>{id}</span>
						</div>
						<div className="info-group">
							<label>Product Name:</label>
							<span>{productName}</span>
						</div>
						<div className="info-group">
							<label>Quantity:</label>
							<span>{numberOfProduct}</span>
						</div>
						<div className="info-group">
							<label>Unit Price:</label>
							<span>₱{productPrice}</span>
						</div>
						<div className="info-group">
							<label>Total Price:</label>
							<span>₱{totalPrice}</span>
						</div>
					</div>

					<hr />

					<div className="customer-info">
						<h3>Customer Details</h3>
						<div className="info-group">
							<label>Name:</label>
							<span>{`${firstName} ${lastName}`}</span>
						</div>
						<div className="info-group">
							<label>Email:</label>
							<span>{email}</span>
						</div>
						<div className="info-group">
							<label>Order Date:</label>
							<span>{createdAt.split("T")[0]}</span>
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

export default OrderDetailsModal;
