import React, { useEffect, useState } from "react";
import Tabulator from "../../Component/Tabulator.tsx";
import {
	faArchive,
	faCheck,
	faDeleteLeft,
	faEye,
} from "@fortawesome/free-solid-svg-icons";
import RequestHandler from "../../Functions/RequestHandler.js";
import { toast, ToastContainer } from "react-toastify";
import "./SCSS/Orders.scss";
import OrderDetailsModal from "../../Component/OrderDetails.tsx";

const headers = [
	"Order ID",
	"Product Name",
	"Quantity",
	"Total",
	"Full Name",
	"Email",
	"Actions",
];

const renderRow = (item) => (
	<>
		<td>{item.id}</td>
		<td>{item.Product.name}</td>
		<td>{item.numberOfProduct}</td>
		<td>{item.numberOfProduct * item.Product.price}</td>
		<td>{item.Customer.firstName + " " + item.Customer.lastName}</td>
		<td>{item.Customer.email}</td>
		<td>{item.createdAt.split("T")[0]}</td>
	</>
);

const CompleteOrders = () => {
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
	];

	const loadRequestData = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"orders/getAllOrderFromUsersTabulator?sellerId=1",
				{ currPage, limit, isComplete: true }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
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

export default CompleteOrders;
