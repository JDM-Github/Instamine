// import React from "react";
// import "./OrderDetails.scss";

// const OrderDetailsModal = ({ isOpen, onClose, order }) => {
// 	if (!isOpen || !order) return null;

// 	const {
// 		id,
// 		Product: { name: productName, price: productPrice },
// 		numberOfProduct,
// 		Customer: { firstName, lastName, email },
// 		createdAt,
// 	} = order;

// 	const totalPrice = numberOfProduct * productPrice;

// 	return (
// 		<div className="order-details-modal">
// 			<div className="modal-content">
// 				<div className="modal-header">
// 					<h2>Order Details</h2>
// 					<button className="close-btn" onClick={onClose}>
// 						&times;
// 					</button>
// 				</div>

// 				<div className="modal-body">
// 					<div className="order-info">
// 						<div className="info-group">
// 							<label>Order ID:</label>
// 							<span>{id}</span>
// 						</div>
// 						<div className="info-group">
// 							<label>Product Name:</label>
// 							<span>{productName}</span>
// 						</div>
// 						<div className="info-group">
// 							<label>Quantity:</label>
// 							<span>{numberOfProduct}</span>
// 						</div>
// 						<div className="info-group">
// 							<label>Unit Price:</label>
// 							<span>₱{productPrice}</span>
// 						</div>
// 						<div className="info-group">
// 							<label>Total Price:</label>
// 							<span>₱{totalPrice}</span>
// 						</div>
// 					</div>

// 					<hr />

// 					<div className="customer-info">
// 						<h3>Customer Details</h3>
// 						<div className="info-group">
// 							<label>Name:</label>
// 							<span>{`${firstName} ${lastName}`}</span>
// 						</div>
// 						<div className="info-group">
// 							<label>Email:</label>
// 							<span>{email}</span>
// 						</div>
// 						<div className="info-group">
// 							<label>Order Date:</label>
// 							<span>{createdAt.split("T")[0]}</span>
// 						</div>
// 					</div>
// 				</div>

// 				<div className="modal-footer">
// 					<button className="close-btn" onClick={onClose}>
// 						Close
// 					</button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default OrderDetailsModal;

import React from "react";
import ReactModal from "react-modal";
import Modal from "react-modal";
import "./OrderDetails.scss";

ReactModal.setAppElement("#root");
const OrderDetailsModal = ({ isOpen, onClose, order }) => {
	if (!order) return null;

	return (
		<>
			{isOpen && (
				<div className="order-details-overlay">
					<div className="modal-content">
						<h3>Order Information</h3>
						<div className="order-info">
							<p>
								<strong>Order ID:</strong> {order.id}
							</p>
							<p>
								<strong>User ID:</strong> {order.userId}
							</p>
							<p>
								<strong>Is Paid:</strong>{" "}
								{order.orderPaid ? "Yes" : "No"}
							</p>
							<p>
								<strong>Subtotal Fee:</strong> ₱
								{order.subTotalFee}
							</p>
							<p>
								<strong>Discount Fee:</strong> ₱
								{order.discountFee}
							</p>
							<p>
								<strong>Shipping Fee:</strong> ₱
								{order.shoppingFee}
							</p>
							<p>
								<strong>Total Fee:</strong> ₱{order.totalFee}
							</p>
							<p>
								<strong>Order Created:</strong>{" "}
								{order.createdAt.split("T")[0]}
							</p>
						</div>
						<div className="product-list">
							{order.products.map((product, index) => (
								<div key={index} className="product-item">
									<img
										src={product.productImage}
										alt={product.name}
										className="product-image"
									/>
									<div className="product-details">
										<p>
											<strong>Name:</strong>{" "}
											{product.name}
										</p>
										<p>
											<strong>Price:</strong> ₱
											{product.price}
										</p>
										<p>
											<strong>Quantity:</strong> x
											{product.numberOfProduct}
										</p>
										<p>
											<strong>Rated:</strong>{" "}
											{product.isRated ? "Yes" : "No"}
										</p>
									</div>
								</div>
							))}
						</div>
						<button onClick={onClose} className="close-button">
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default OrderDetailsModal;
