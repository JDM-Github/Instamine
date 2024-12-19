import React, { useEffect, useState } from "react";
import Tabulator from "../../Component/Tabulator.tsx";
import {
	faArchive,
	faCheck,
	faDeleteLeft,
	faEye,
	faMessage,
} from "@fortawesome/free-solid-svg-icons";
import RequestHandler from "../../Functions/RequestHandler.js";
import { toast, ToastContainer } from "react-toastify";
import "./SCSS/Orders.scss";
import OrderDetailsModal from "../../Component/OrderDetails.tsx";

const headers = [
	"Order ID",
	"Customer ID",
	"Is Paid",
	"Subtotal",
	"Discount",
	"Shipping Fee",
	"Total",
	"Created At",
	"Actions",
];

const renderRow = (item) => (
	<>
		<td>{item.id}</td>
		<td>{item.userId}</td>
		<td>{item.orderPaid ? "YES" : "NO"}</td>
		<td>{item.subTotalFee}</td>
		<td>{item.discountFee}</td>
		<td>{item.shoppingFee}</td>
		<td>{item.totalFee}</td>
		<td>{item.createdAt.split("T")[0]}</td>
	</>
);

const DelieveredOrders = () => {
	const [requestData, setRequestData] = useState([]);
	const [currPage, setCurrPage] = useState(1);
	const [total, setTotal] = useState(0);
	const limit = 10;

	const [isModalOpen, setModalOpen] = useState(false);
	const [modalOrder, setModalOrder] = useState(null);

	const openModal = (item) => {
		setModalOrder(item);
		setModalOpen(true);
	};

	const actions = [
		{
			icon: faEye,
			className: "view-btn",
			label: "VIEW",
			onClick: (id, item) => openModal(item),
		},
		// {
		// 	icon: faMessage,
		// 	className: "done-btn",
		// 	label: "MESSAGE",
		// },
	];

	const loadRequestData = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"orders/get-batch-orders-tabulator",
				{
					toShip: false,
					toReceive: true,
					isComplete: false,
					currPage,
					limit,
				}
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				// alert(JSON.stringify(data.data));
				// console.log(JSON.stringify(data.data));
				setRequestData(data.data);
				setTotal(data.total);
			}
		} catch (error) {
			toast.error(`An error occurred while requesting data. ${error}`);
		}
	};
	useEffect(() => {
		loadRequestData();
	}, [currPage]);

	return (
		<>
			<div className="orders-tabulator">
				<Tabulator
					data={requestData}
					headers={headers}
					renderRow={renderRow}
					actions={actions}
					buttons={[]}
					selects={[]}
					currentPage={currPage}
					setCurrentPage={setCurrPage}
					itemsPerPage={limit}
					total={total}
				/>
			</div>
			<OrderDetailsModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				order={modalOrder}
			/>
		</>
	);
};

export default DelieveredOrders;
