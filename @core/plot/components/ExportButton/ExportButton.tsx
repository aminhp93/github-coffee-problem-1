import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { GridRowsProp } from "@mui/x-data-grid";
import { MouseEvent, ReactElement, useState } from "react";
import { ExportType } from "../../common/types";

// ** Translation Imports
import { useTranslation } from "react-i18next";

export interface ExportButtonProps {
	rows: GridRowsProp;
	handleCbExport?: (type: ExportType) => void;
}

export default function ExportButton({ rows, handleCbExport }: ExportButtonProps): ReactElement {
	const { t } = useTranslation();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const open = Boolean(anchorEl);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			{rows.length ? (
				<Tooltip title={t("echarts.exportButton.export")}>
					<IconButton role="ExportBtn" onClick={handleClick}>
						<FileDownloadIcon />
					</IconButton>
				</Tooltip>
			) : (
				<IconButton role="ExportBtn" onClick={handleClick} disabled>
					<FileDownloadIcon />
				</IconButton>
			)}

			<Menu
				role="ExportTypeMenu"
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
			>
				<MenuItem
					onClick={() => {
						handleCbExport && handleCbExport("csv");
						handleClose();
					}}
				>
					<Box data-testid=".csv">{`.csv`}</Box>
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleCbExport && handleCbExport("png");
						handleClose();
					}}
				>
					<Box data-testid=".png">{`.png`}</Box>
				</MenuItem>
			</Menu>
		</>
	);
}
