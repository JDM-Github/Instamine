import React from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const customOption = (props) => {
	const { innerRef, innerProps, data } = props;
	return (
		<div
			ref={innerRef}
			{...innerProps}
			style={{
				display: "flex",
				alignItems: "center",
				padding: "8px",
				cursor: "pointer",
			}}
		>
			<FontAwesomeIcon icon={data.icon} style={{ marginRight: 10 }} />
			{data.label}
		</div>
	);
};

function IconSelect({ selectOptions }) {
	return (
		<Select
			options={selectOptions.options}
			components={{
				Option: customOption,
			}}
			onChange={(e) => selectOptions.onChange(e.value)}
			placeholder={selectOptions.placeholder ?? ""}
			styles={{
				control: (base) => ({
					...base,
					border: "none",
					outline: "none",
					background: "#76b349",
					minWidth: "100px",
					width: "100%",
					color: "white",
					boxShadow: "none",
					fontWeight: "bold",
					userSelect: "none",
					fontSize: "1rem",
				}),
				placeholder: (base) => ({
					...base,
					color: "white",
					fontWeight: "bold",
					userSelect: "none",
					fontSize: "1rem",
				}),
				singleValue: (base) => ({
					...base,
					color: "white",
					fontWeight: "bold",
					userSelect: "none",
					fontSize: "1rem",
				}),
				menu: (base) => ({
					...base,
					width: "auto",
					left: "0",
				}),
				menuPortal: (base) => ({
					...base,
					zIndex: 9999,
					left: "auto",
				}),
			}}
		/>
	);
}

export default function TopTabulator({
	searchPlaceholder,
	buttons,
	selectOptions,
}) {
	return (
		<div className="top-tabulator">
			<input
				className="search"
				placeholder={searchPlaceholder || "Search..."}
			/>
			<div className="right-side">
				<div className="buttons">
					{buttons.map((button, index) => (
						<div
							key={index}
							className={`btn-items ${button.className}`}
							onClick={button.onClick}
						>
							<FontAwesomeIcon icon={button.icon} />
							<span>{button.label}</span>
						</div>
					))}
				</div>
				{selectOptions &&
					selectOptions.map((select, selectIndex) => (
						<IconSelect selectOptions={select} />
					))}
			</div>
		</div>
	);
}
