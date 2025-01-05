import React, { useEffect, useState } from "react";
import Tabulator from "../../Component/Tabulator.tsx";
import {
	faArchive,
	faCheck,
	faCheckCircle,
	faComments,
	faEye,
	faLock,
	faMessage,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import RequestHandler from "../../Functions/RequestHandler.js";
import { toast, ToastContainer } from "react-toastify";
import "./Users.scss";
import UserDetailsModal from "../../Component/UserDetails.tsx";

const headers = [
	"ID",
	"Full Name",
	"Email",
	"Phone No.",
	"Created At",
	"Actions",
];

const renderRow = (item) => (
	<>
		<td>{item.id}</td>
		<td>{item.firstName + " " + item.lastName}</td>
		<td>{item.email}</td>
		<td>{item.phoneNumber}</td>
		<td>{item.createdAt.split("T")[0]}</td>
	</>
);

const Users = ({ setOpenModal, setSelectedUser }) => {
	const [isArchived, setIsArchived] = useState<boolean | null>(false);
	const [requestData, setRequestData] = useState([]);
	const [currPage, setCurrPage] = useState(1);
	const [total, setTotal] = useState(0);
	const limit = 10;

	const [isModalOpen, setModalOpen] = useState(false);
	const [userDetail, setUserDetail] = useState(null);

	const openModal = (item) => {
		setUserDetail(item);
		setModalOpen(true);
	};

	const selectOptions = [
		{
			placeholder: "ACTIVE",
			options: [
				{ value: "unarchived", label: "ACTIVE", icon: faCheckCircle },
				{ value: "archived", label: "LOCKED", icon: faArchive },
			],
			onChange: (e) => {
				if (e == "all") setIsArchived(null);
				else setIsArchived(e === "archived");
			},
		},
	];
	const actions = [
		{
			icon: faEye,
			className: "view-btn",
			label: "VIEW",
			onClick: (id, item) => openModal(item),
		},
		{
			icon: faLock,
			className: "delete-btn",
			label: "UNLOCKED",
			label2: "LOCKED",
			onConditionLabel: (item) => item.isArchived,
			onClick: (id) => archiveAccount(id),
		},
		{
			icon: faMessage,
			className: "done-btn",
			label: "MESSAGE",
			onClick: (id, item) => loadChatModal(item),
		},
	];

	const loadChatModal = async (item) => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/get-user-chat",
				{ userId: "1", partnerId: item.id }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				setOpenModal(true);
				setSelectedUser(data.chat);
			}
		} catch (error) {
			toast.error(`An error occurred while requesting data. ${error}`);
		}
	};

	const loadRequestData = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"user/get_accounts",
				{ currPage, limit, isArchived }
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

	const archiveAccount = async (id) => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"user/set_archived",
				{ id }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				toast.success(data.message);
			}
			loadRequestData();
		} catch (error) {
			toast.error(`An error occurred while archiving data. ${error}`);
		}
	};
	useEffect(() => {
		loadRequestData();
	}, [currPage, isArchived]);

	return (
		<>
			<div className="users-tabulator">
				<Tabulator
					data={requestData}
					headers={headers}
					renderRow={renderRow}
					actions={actions}
					buttons={[]}
					selects={selectOptions}
					currentPage={currPage}
					setCurrentPage={setCurrPage}
					itemsPerPage={limit}
					total={total}
					searchableHeaders={[
						"id",
						"firstName",
						"lastName",
						"email",
						"phoneNumber",
					]}
				/>
			</div>
			<UserDetailsModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				order={userDetail}
			/>
		</>
	);
};

export default Users;
