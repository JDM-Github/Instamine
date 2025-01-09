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
						<h3 className="text-2xl font-semibold text-pink-600 mb-3 bg-pink-100 border-l-4 border-pink-600 rounded-lg p-3">
							Order Information
						</h3>
						<div className="order-info mb-6 rounded-lg grid grid-cols-1 gap-2 bg-gray-50 p-2">
							<div className="flex items-center">
								<label
									htmlFor="order-id"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									Order ID:
								</label>
								<input
									id="order-id"
									type="text"
									value={order.id}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="user-id"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									User ID:
								</label>
								<input
									id="user-id"
									type="text"
									value={order.userId}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="user-location"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									User Location:
								</label>
								<input
									id="user-location"
									type="text"
									value={order.User.location}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="user-phone"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									User Phone Number:
								</label>
								<input
									id="user-phone"
									type="text"
									value={order.User.phoneNumber}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="is-paid"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									Is Paid:
								</label>
								<input
									id="is-paid"
									type="text"
									value={order.orderPaid ? "Yes" : "No"}
									readOnly
									className={`w-2/3 text-sm ${
										order.orderPaid
											? "text-green-600"
											: "text-red-600"
									} bg-gray-100 p-2 border-none focus:outline-none`}
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="discount-fee"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									Discount Fee:
								</label>
								<input
									id="discount-fee"
									type="text"
									value={`₱${order.discountFee}`}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="shipping-fee"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									Shipping Fee:
								</label>
								<input
									id="shipping-fee"
									type="text"
									value={`₱${order.shoppingFee}`}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="total-fee"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									Total Fee:
								</label>
								<input
									id="total-fee"
									type="text"
									value={`₱${order.totalFee}`}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="order-created"
									className="w-1/3 text-sm font-medium text-gray-700"
								>
									Order Created:
								</label>
								<input
									id="order-created"
									type="text"
									value={order.createdAt.split("T")[0]}
									readOnly
									className="w-2/3 text-sm text-gray-700 bg-gray-100 p-2 border-none focus:outline-none"
								/>
							</div>
						</div>

						<div
							className="product-list overflow-y-auto max-h-72 mb-6"
							style={{ maxHeight: "300px" }}
						>
							<table className="w-full table-auto bg-gray-100 rounded-lg shadow-sm">
								<thead>
									<tr className="bg-gray-200 text-gray-700 text-left">
										<th className="p-2">Image</th>
										<th className="p-2">Name</th>
										<th className="p-2">Price</th>
										<th className="p-2">Quantity</th>
										<th className="p-2">Rated</th>
									</tr>
								</thead>
								<tbody>
									{order.products.map((product, index) => (
										<tr
											key={index}
											className="border-b last:border-none"
										>
											<td className="p-2">
												<img
													src={product.productImage}
													alt={product.name}
													className="w-16 h-16 object-cover rounded-md"
												/>
											</td>
											<td className="p-2 text-gray-800">
												{product.name}
											</td>
											<td className="p-2 text-gray-700">
												₱{product.price}
											</td>
											<td className="p-2 text-gray-700">
												x{product.numberOfProduct}
											</td>
											<td
												className={`p-2 ${
													product.isRated
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{product.isRated ? "Yes" : "No"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
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
