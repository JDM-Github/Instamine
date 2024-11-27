import React, { useEffect, useState } from "react";
import Tabulator from "../../Component/Tabulator.tsx";
import {
	faEye,
	faPlus,
	faRecordVinyl,
} from "@fortawesome/free-solid-svg-icons";
import RequestHandler from "../../Functions/RequestHandler.js";
import { toast, ToastContainer } from "react-toastify";
import "./SCSS/Orders.scss";
import OrderDetailsModal from "../../Component/OrderDetails.tsx";
import ScheduleLiveModal from "../../Component/ScheduleLive.tsx";
import ViewLiveScheduleModal from "../../Component/ViewLiveSchedule.tsx";
import { useNavigate } from "react-router-dom";

const headers = ["Live ID", "URL", "Time Start", "Created At", "Actions"];

const renderRow = (item) => (
	<>
		<td>{item.id}</td>
		<td>{item.url}</td>
		<td>{new Date(item.startTimestamp).toLocaleString()}</td>
		<td>{item.createdAt.split("T")[0]}</td>
	</>
);

type Product = {
	id: number;
	name: string;
	userId: number;
	product_image: string | null;
	product_images: string[] | null;
	price: number;
	number_of_stock: number;
	number_of_sold: number;
	specification: string;
	active: boolean | null;
	category: string;
};

const ScheduleLivestream = () => {
	const navigate = useNavigate();
	const [requestData, setRequestData] = useState([]);
	const [currPage, setCurrPage] = useState(1);
	const [total, setTotal] = useState(0);
	const limit = 10;

	const [isModalOpen, setModalOpen] = useState(false);
	const [scheduleModal, setModalSchedule] = useState(null);
	const [opeModal, setopeModal] = useState(false);
	const [productsData, setProductsData] = useState<Product[]>([]);

	const openModal = (item) => {
		setModalSchedule(item);
		setModalOpen(true);
	};

	const buttons = [
		{
			icon: faPlus,
			label: "Add Schedule",
			className: "add-schedule",
			onClick: () => setopeModal(true),
		},
	];

	const actions = [
		{
			icon: faRecordVinyl,
			className: "done-btn",
			label: "START",
			onClick: async (id, item) => {
				try {
					const data = await RequestHandler.handleRequest(
						"post",
						"youtube/set-live-complete",
						{
							id: item.id,
						}
					);
					if (data.success === false) {
						toast.error(
							data.message ||
								"Error occurred. Please check your credentials."
						);
					} else {
						navigate("/stream", {
							state: { streamUrl: item.url, isStream: true },
						});
					}
				} catch (error) {
					toast.error(
						`An error occurred while requesting data. ${error}`
					);
				}
			},
		},
		{
			icon: faEye,
			className: "view-btn",
			label: "VIEW",
			onClick: (id, item) => openModal(item),
		},
		{
			icon: faEye,
			className: "delete-btn",
			label: "DELETE",
			onClick: async (id, item) => {
				try {
					const data = await RequestHandler.handleRequest(
						"post",
						"youtube/delete-live",
						{
							id: item.id,
						}
					);
					if (data.success === false) {
						toast.error(
							data.message ||
								"Error occurred. Please check your credentials."
						);
					} else {
						loadRequestData();
						loadAllProduct();
						toast.success("Live Schedule deleted successfully");
					}
				} catch (error) {
					toast.error(
						`An error occurred while requesting data. ${error}`
					);
				}
			},
		},
	];

	const loadRequestData = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"youtube/get-all-live",
				{
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
				setRequestData(data.data);
				setTotal(data.total);
			}
		} catch (error) {
			toast.error(`An error occurred while requesting data. ${error}`);
		}
	};
	const loadAllProduct = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/getAllProduct",
				{ isArchived: false }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please	check your credentials."
				);
			} else {
				setProductsData(data.products);
			}
		} catch (error) {
			toast.error(`An	error occurred while requesting	data. ${error}`);
		}
	};

	const reset = () => {
		loadRequestData();
		loadAllProduct();
	};
	useEffect(() => {
		loadRequestData();
		loadAllProduct();
	}, [currPage]);

	return (
		<>
			<div className="orders-tabulator">
				<Tabulator
					data={requestData}
					headers={headers}
					renderRow={renderRow}
					actions={actions}
					buttons={buttons}
					selects={[]}
					currentPage={currPage}
					setCurrentPage={setCurrPage}
					itemsPerPage={limit}
					total={total}
				/>
			</div>
			<ViewLiveScheduleModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				schedule={scheduleModal}
			/>
			<ScheduleLiveModal
				isOpen={opeModal}
				onClose={() => setopeModal(false)}
				products={productsData}
				reset={reset}
			/>
		</>
	);
};

export default ScheduleLivestream;
