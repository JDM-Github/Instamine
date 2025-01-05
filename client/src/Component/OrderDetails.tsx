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
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
						<h3 className="text-2xl font-semibold text-pink-600 mb-6">
							Order Information
						</h3>
						<div className="order-info mb-6">
							<p className="text-sm text-gray-700">
								<strong>Order ID:</strong> {order.id}
							</p>
							<p className="text-sm text-gray-700">
								<strong>User ID:</strong> {order.userId}
							</p>
							<p className="text-sm text-gray-700">
								<strong>Is Paid:</strong>{" "}
								<span
									className={
										order.orderPaid
											? "text-green-600"
											: "text-red-600"
									}
								>
									{order.orderPaid ? "Yes" : "No"}
								</span>
							</p>
							{/* <p className="text-sm text-gray-700">
								<strong>Subtotal Fee:</strong> ₱
								{order.subTotalFee}
							</p>
							<p className="text-sm text-gray-700">
								<strong>Discount Fee:</strong> ₱
								{order.discountFee}
							</p>
							<p className="text-sm text-gray-700">
								<strong>Shipping Fee:</strong> ₱
								{order.shoppingFee}
							</p> */}
							<p className="text-sm text-gray-700">
								<strong>Total Fee:</strong> ₱{order.totalFee}
							</p>
							<p className="text-sm text-gray-700">
								<strong>Order Created:</strong>{" "}
								{order.createdAt.split("T")[0]}
							</p>
						</div>

						<div className="product-list space-y-4 mb-6">
							{order.products.map((product, index) => (
								<div
									key={index}
									className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm"
								>
									<img
										src={product.productImage}
										alt={product.name}
										className="w-16 h-16 object-cover rounded-md"
									/>
									<div className="flex-1 pl-4">
										<p className="text-sm font-semibold text-gray-800">
											<strong>Name:</strong>{" "}
											{product.name}
										</p>
										<p className="text-sm text-gray-700">
											<strong>Price:</strong> ₱
											{product.price}
										</p>
										<p className="text-sm text-gray-700">
											<strong>Quantity:</strong> x
											{product.numberOfProduct}
										</p>
										<p className="text-sm text-gray-700">
											<strong>Rated:</strong>{" "}
											<span
												className={
													product.isRated
														? "text-green-600"
														: "text-red-600"
												}
											>
												{product.isRated ? "Yes" : "No"}
											</span>
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="flex justify-end">
							<button
								onClick={onClose}
								className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition duration-300"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default OrderDetailsModal;
