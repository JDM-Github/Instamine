import React, { useEffect, useState } from "react";
import Tabulator from "../../Component/Tabulator.tsx";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import RequestHandler from "../../Functions/RequestHandler.js";
import { toast } from "react-toastify";
import "./SCSS/Orders.scss";
import ViewLiveScheduleModal from "../../Component/ViewLiveSchedule.tsx";

const headers = ["Live ID", "URL", "Time Start", "Created At", "Actions"];

const renderRow = (item) => (
	<>
		<td>{item.id}</td>
		<td>{item.url}</td>
		<td>{new Date(item.startTimestamp).toLocaleString()}</td>
		<td>{item.createdAt.split("T")[0]}</td>
	</>
);

const CompletedLive = () => {
	const [requestData, setRequestData] = useState([]);
	const [currPage, setCurrPage] = useState(1);
	const [total, setTotal] = useState(0);
	const limit = 10;

	const [isModalOpen, setModalOpen] = useState(false);
	const [scheduleModal, setModalSchedule] = useState(null);

	const openModal = (item) => {
		setModalSchedule(item);
		setModalOpen(true);
	};

	const buttons = [];
	const actions = [
		{
			icon: faEye,
			className: "view-btn",
			label: "VIEW",
			onClick: (id, item) => openModal(item),
		},
		// {
		// 	icon: faEye,
		// 	className: "delete-btn",
		// 	label: "ARCHIVE",
		// 	onClick: (id, item) => {},
		// },
	];

	const loadRequestData = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"youtube/get-all-live-complete",
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
					buttons={buttons}
					selects={[]}
					currentPage={currPage}
					setCurrentPage={setCurrPage}
					itemsPerPage={limit}
					total={total}
					searchableHeaders={["id", "url"]}
				/>
			</div>
			<ViewLiveScheduleModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				schedule={scheduleModal}
			/>
		</>
	);
};

export default CompletedLive;
