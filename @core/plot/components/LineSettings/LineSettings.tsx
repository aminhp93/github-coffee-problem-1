import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import type { EChartsOption } from "echarts";
import { ChangeEvent, MouseEvent, ReactElement, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { getFormatterTooltip } from "../../common/utils";
import { MenuItemContent } from "../MenuItemContent/MenuItemContent";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// ** Translation Imports
import { useTranslation } from "react-i18next";

const useStyles = makeStyles()({
	selectChartType: {
		width: "136px",
		height: "32px",
		"& .MuiSelect-select": {},
	},
	textField: {
		"& .MuiOutlinedInput-input": {
			padding: "6px 12px",
			width: "112px",
			height: "20px",
		},
	},
	headerBarContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
	button: {
		color: "#14ACFF",
		fontWeight: 600,
		minWidth: 0,
	},
});

type ITypeChart = "line" | "bar" | "scatter";

export interface LineSettingsProps {
	cbRemove: () => void;
	cb: (data: EChartsOption) => void;
	isEnumDataType?: boolean;
}

export default function LineSettings({
	cb,
	cbRemove,
	isEnumDataType,
}: LineSettingsProps): ReactElement {
	const { t } = useTranslation();
	const { classes } = useStyles();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [decimal, setDecimal] = useState(2);
	const [isStepLine, setIsStepLine] = useState(false);
	const [typeChart, setTypeChart] = useState<ITypeChart>("line");

	const open = Boolean(anchorEl);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleChangeDecimal = (e: ChangeEvent<HTMLInputElement>) => {
		const newOption: EChartsOption = {
			yAxis: {
				axisPointer: {
					label: {
						formatter: (data: unknown) => {
							return (
								data as {
									value: number;
								}
							).value.toFixed(parseInt(e.target.value));
						},
					},
				},
			},
			tooltip: {
				formatter: (data: unknown) => {
					return getFormatterTooltip(data, parseInt(e.target.value));
				},
			},
			decimalNumber: parseInt(e.target.value),
		};
		setDecimal(parseInt(e.target.value));
		cb && cb(newOption);
	};

	const handleSwitchStepLine = (e: ChangeEvent<HTMLInputElement>) => {
		const newOption: EChartsOption = {
			series: {
				step: e.target.checked ? "start" : false,
			},
		};
		setIsStepLine(e.target.checked);
		cb && cb(newOption);
	};

	const handleChangeType = (e: SelectChangeEvent) => {
		const newOption: EChartsOption = {
			series: {
				type: e.target.value as ITypeChart,
			},
		};
		setTypeChart(e.target.value as ITypeChart);
		cb && cb(newOption);
	};

	return (
		<Box>
			<Tooltip title={t("echarts.lineSettings.settings")}>
				<IconButton role="SettingsBtn" onClick={handleClick}>
					<MoreVertIcon />
				</IconButton>
			</Tooltip>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
					disablePadding: true,
				}}
			>
				<Box
					sx={{
						padding: "6px 8px 6px 16px",
						backgroundColor: "#FFFFFF",
						marginBottom: "1px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottom: "1px solid #E8E8E8",
					}}
				>
					<Typography sx={{ fontWeight: "600" }}>{t("echarts.lineSettings.settings")}</Typography>
					<IconButton role="settings" onClick={handleClose}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Box>

				{!isEnumDataType && (
					<MenuItem disableRipple sx={{ width: "312px", padding: "4px 16px", cursor: "default" }}>
						<MenuItemContent>
							<Typography>{t("echarts.lineSettings.decimal")}</Typography>
							<TextField
								className={classes.textField}
								value={decimal}
								size="small"
								type="number"
								inputProps={{ min: 0 }}
								onChange={handleChangeDecimal}
							/>
						</MenuItemContent>
					</MenuItem>
				)}

				<MenuItem disableRipple sx={{ width: "312px", padding: "4px 16px", cursor: "default" }}>
					<MenuItemContent>
						<Typography>{t("echarts.lineSettings.chartType")}</Typography>
						<Select
							className={classes.selectChartType}
							labelId="time-frame"
							id="time-frame-select"
							IconComponent={KeyboardArrowDownIcon}
							value={typeChart}
							label=""
							onChange={handleChangeType}
						>
							<MenuItem value={"line"}>{t("echarts.lineSettings.line")}</MenuItem>
							<MenuItem value={"bar"}>{t("echarts.lineSettings.bar")}</MenuItem>
							{!isEnumDataType && (
								<MenuItem value={"scatter"}>{t("echarts.lineSettings.scatter")}</MenuItem>
							)}
						</Select>
					</MenuItemContent>
				</MenuItem>

				{typeChart === "line" && (
					<MenuItem disableRipple sx={{ padding: "4px 16px", cursor: "default" }}>
						<MenuItemContent>
							<Typography>{t("echarts.lineSettings.stepLine")}</Typography>
							<Switch
								disabled={isEnumDataType}
								size="small"
								checked={isEnumDataType ? true : isStepLine}
								onChange={handleSwitchStepLine}
							/>
						</MenuItemContent>
					</MenuItem>
				)}

				<MenuItem disableRipple sx={{ padding: "4px 16px", cursor: "default" }}>
					<MenuItemContent>
						<Typography color="error" sx={{ fontWeight: "500" }}>
							{t("echarts.lineSettings.remove")}
						</Typography>
						<IconButton
							sx={{ marginRight: "-6px" }}
							role="remove"
							onClick={() => cbRemove && cbRemove()}
						>
							<DeleteOutlineIcon color="error" fontSize="small" />
						</IconButton>
					</MenuItemContent>
				</MenuItem>
			</Menu>
		</Box>
	);
}
