import React, { useState } from "react";
import Tabulator from "../../Component/Tabulator.tsx";
import { faArchive, faCheck, faEye } from "@fortawesome/free-solid-svg-icons";
import "./Users.scss";

const headers = [
	"ID",
	"Full Name",
	"Is Seller",
	"Number of Products",
	"Created At",
	"Actions",
];

const renderRow = (item) => (
	<>
		<td>{item.id}</td>
		<td>{item.User.id}</td>
		<td>{item.User.firstname + " " + item.User.lastname}</td>
		<td>{item.Service.serviceName}</td>
		<td>{item.status}</td>
		<td>{item.createdAt.split("T")[0]}</td>
	</>
);

const Users = () => {
	const [requestData, setRequestData] = useState([]);
	const [currPage, setCurrPage] = useState(1);
	const [total, setTotal] = useState(0);
	const limit = 10;

	const actions = [
		{
			icon: faEye,
			className: "view-btn",
			label: "VIEW",
			// onClick: (id) => viewServiceRequest(id),
		},
		{
			icon: faCheck,
			className: "done-btn",
			label: "ACCEPT",
			onCondition: (item) => !item.isArchived,
			// onClick: (id) => acceptRequest(id),
		},
		{
			icon: faArchive,
			className: "delete-btn",
			label: "ARCHIVED",
			// onClick: (id) => archiveRequest(id),
		},
	];
	return (
		<div className="users-tabulator">
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
	);
};

export default Users;
