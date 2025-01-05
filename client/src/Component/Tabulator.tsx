import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TopTabulator from "./TopTabulator.tsx";
import Paginator from "./Paginator.tsx";
import "./Tabulator.scss";

export default function Tabulator({
	data,
	headers,
	renderRow,
	actions,
	buttons,
	selects,

	currentPage,
	setCurrentPage,
	itemsPerPage,

	total,
	searchableHeaders,
}) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredData = data.filter((item) => {
		// alert(JSON.stringify(fieldValue));

		return searchableHeaders.some((header) => {
			const fieldValue = item[header];

			if (fieldValue) {
				return fieldValue
					.toString()
					.toLowerCase()
					.includes(searchQuery.toLowerCase());
			}
			return false;
		});
	});
	return (
		<div className="tabulator">
			<TopTabulator
				searchPlaceholder="Search..."
				searchQuery={searchQuery}
				onSearchChange={(e) => setSearchQuery(e.target.value)}
				buttons={buttons}
				selectOptions={selects}
			/>
			<div className="table-wrapper">
				<table>
					<thead>
						<tr>
							{headers.map((header, index) => (
								<th key={index}>{header}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{filteredData.map((item, rowIndex) => (
							<tr key={rowIndex}>
								{renderRow(item)}
								{actions && (
									<td>
										<div className="action-buttons">
											{actions.map(
												(action, index) =>
													(action.onCondition ===
														null ||
														action.onCondition ===
															undefined ||
														action.onCondition(
															item
														)) && (
														<button
															key={index}
															className={`${action.className}`}
															onClick={() =>
																action.onClick(
																	item.id,
																	item
																)
															}
														>
															<FontAwesomeIcon
																icon={
																	action.icon
																}
															/>
															{action.label && (
																<div
																	style={{
																		marginLeft:
																			"5px",
																	}}
																>
																	{action.onConditionLabel ===
																		null ||
																	action.onConditionLabel ===
																		undefined ||
																	action.onConditionLabel(
																		item
																	)
																		? action.label
																		: action.label2}
																</div>
															)}
														</button>
													)
											)}
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Paginator
				currentPage={currentPage}
				totalItems={total}
				itemsPerPage={itemsPerPage}
				onPageChange={setCurrentPage}
			/>
		</div>
	);
}
