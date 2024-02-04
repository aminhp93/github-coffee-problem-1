// ** React Imports
import { ChangeEvent, memo, MouseEvent, ReactElement, useState } from "react";

// ** MUI Imports
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import { GridRowsProp } from "@mui/x-data-grid";
import { makeStyles } from "tss-react/mui";

// ** Third Party Components
import type {
	DataZoomComponentOption,
	EChartsOption,
	GridComponentOption,
	LineSeriesOption,
	TooltipComponentOption,
} from "echarts";

// ** Custom Components
import PMP from "../../../../PMP";
import ExportButton from "../ExportButton/ExportButton";
import YAxisSettings from "../YAxisSettings/YAxisSettings";

// ** Constants
import {
	DATAZOOM_OPTION,
	GRID_OPTION,
	INewYAxisItem,
	TOOLTIP_OPTION,
} from "../../common/constants";
import { AddedTag, ExportType, IPMP, Tags } from "../../common/types";
import { getGrid, setOffsetYAxis } from "../../common/utils";
import { MenuItemContent } from "../MenuItemContent/MenuItemContent";

// ** Translation Imports
import { useTranslation } from "react-i18next";

const useStyles = makeStyles()({
	root: {
		display: "flex",
		justifyContent: "space-between",
		"& .MuiTooltip-tooltip": {
			fontSize: "1rem",
		},

		"& .MuiIconButton-root": {
			padding: "4px",
		},
		fontSize: "14px",
	},
	button: {
		textTransform: "none",
	},
	hiddenHeaderName: {
		color: "#4C585E !important",
	},
	objectNameHeader: {
		"& .MuiDataGrid-columnHeaderTitle": {
			marginLeft: "74px",
		},
	},
	resolutionText: {
		color: "#1E294B",
		opacity: 0.6,
	},
	resolutionValueText: {
		color: "#1E294B",
		opacity: 0.8,
	},
	menu: {
		"& .MuiList-root": {
			paddingTop: "0",
			paddingBottom: "0",
		},
		"& .MuiMenuItem-root": {
			paddingTop: "4px",
			paddingBottom: "4px",
			backgroundColor: "#FFFFFF",
		},
	},
});

export interface EchartsSettingsProps {
	option: EChartsOption;
	rows: GridRowsProp;
	tags: Tags;
	handleRefresh: () => void;
	handleExport?: (type: ExportType) => void;
	handleAdd?: (data: AddedTag[]) => void;
	handleUpdateSettings?: (data: EChartsOption) => void;
	handleShowTableData?: (data: boolean) => void;
	handleRemoveAll?: () => void;
}

function EchartsSettings({
	option,
	rows,
	tags,
	handleRefresh,
	handleExport,
	handleAdd,
	handleUpdateSettings,
	handleShowTableData,
	handleRemoveAll,
}: EchartsSettingsProps): ReactElement {
	const { classes } = useStyles();
	const { t } = useTranslation();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const [isAxisPointer, setIsAxisPointer] = useState(true);
	const [isDataZoom, setIsDataZoom] = useState(true);
	const [showTable, setShowTable] = useState(true);

	const handleToggleYAxis = (data: INewYAxisItem, dataCb: EChartsOption) => {
		const yAxis = [...(option.yAxis as INewYAxisItem[])];
		const series = [...(option.series as LineSeriesOption[])];

		let offsetRight = 0;
		let offsetLeft = 0;

		const index = series.findIndex((i: LineSeriesOption) => i.id === data.yAxisId);
		if (index > -1) {
			const yAxisIndex = (
				series[index] as {
					yAxisIndex: number;
				}
			).yAxisIndex;

			const yAxisItem = yAxis[yAxisIndex];
			if (!yAxisItem) return;
			yAxis.forEach((_, index: number) => {
				if (index === yAxisIndex) {
					yAxis[index].position = (dataCb.yAxis as INewYAxisItem).position;
				}
			});
			const { offsetLeft: updatedOffsetLeft, offsetRight: updatedOffsetRight } =
				setOffsetYAxis(yAxis);
			offsetRight = updatedOffsetRight;
			offsetLeft = updatedOffsetLeft;
		}

		const grid = getGrid({ grid: option.grid as GridComponentOption, offsetRight, offsetLeft });

		const newOption = { yAxis, grid };
		handleUpdateSettings && handleUpdateSettings(newOption);
	};

	const handleChangeColorYAxis = (data: INewYAxisItem, dataCb: EChartsOption) => {
		const yAxis = [...(option.yAxis as INewYAxisItem[])];
		const indexYAxis = yAxis.findIndex((i: INewYAxisItem) => i.yAxisId === data.yAxisId);

		if (indexYAxis > -1) {
			yAxis[indexYAxis] = { ...yAxis[indexYAxis], ...dataCb.yAxis } as INewYAxisItem;
		}
		const newOption = { yAxis };

		handleUpdateSettings && handleUpdateSettings(newOption);
	};

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSwitchAxisPointer = (e: ChangeEvent<HTMLInputElement>) => {
		const tooltip: TooltipComponentOption = e.target.checked
			? TOOLTIP_OPTION
			: {
					trigger: "axis",
					axisPointer: {
						type: "cross",
					},
					showContent: false,
			  };
		const newOption = { tooltip };

		handleUpdateSettings && handleUpdateSettings(newOption);
		setIsAxisPointer(e.target.checked);
	};

	const handleSwitchTableData = (e: ChangeEvent<HTMLInputElement>) => {
		handleShowTableData && handleShowTableData(e.target.checked);
		setShowTable(e.target.checked);
	};

	const handleSwitchDataZoom = (e: ChangeEvent<HTMLInputElement>) => {
		const newDataZoom: DataZoomComponentOption[] = e.target.checked
			? DATAZOOM_OPTION
			: [
					{
						...DATAZOOM_OPTION[0],
						show: false,
					},
					{
						...DATAZOOM_OPTION[1],
					},
			  ];

		const newGrid = e.target.checked
			? {
					bottom: GRID_OPTION.bottom,
			  }
			: {
					bottom: "60px",
			  };

		const newOption = {
			dataZoom: newDataZoom,
			grid: newGrid,
		};

		handleUpdateSettings && handleUpdateSettings(newOption);
		setIsDataZoom(e.target.checked);
	};

	const handleAutoScale = (data: INewYAxisItem, dataCb: EChartsOption) => {
		const yAxis = [...(option.yAxis as INewYAxisItem[])];
		const indexYAxis = yAxis.findIndex((i: INewYAxisItem) => i.yAxisId === data.yAxisId);

		if (indexYAxis > -1) {
			yAxis[indexYAxis] = { ...yAxis[indexYAxis], ...dataCb.yAxis } as INewYAxisItem;
		}
		const newOption = { yAxis };

		handleUpdateSettings && handleUpdateSettings(newOption);
	};

	const isTagSelected = !!Object.keys(tags).length;

	return (
		<Box className={classes.root}>
			<Tooltip title={t("echarts.echartsSettings.addTag")}>
				<IconButton
					role="addTag"
					onClick={() => {
						(PMP as unknown as IPMP).App.TagExplorer2.pickTags({
							maxNumberOfTags: 5,
							onFinished: handleAdd,
						});
					}}
				>
					<AddIcon />
				</IconButton>
			</Tooltip>
			<ExportButton rows={rows} handleCbExport={handleExport} />
			<Tooltip title={t("echarts.echartsSettings.refresh")}>
				<IconButton role="refresh" disabled={!isTagSelected} onClick={handleRefresh}>
					<RefreshIcon />
				</IconButton>
			</Tooltip>
			<Tooltip title={t("echarts.echartsSettings.removeAll")}>
				<IconButton role="removeAll" disabled={!isTagSelected} onClick={handleRemoveAll}>
					<DeleteIcon />
				</IconButton>
			</Tooltip>
			<Tooltip title={t("echarts.echartsSettings.settings")}>
				<IconButton role="settings" onClick={handleClick}>
					<MoreVertIcon />
				</IconButton>
			</Tooltip>
			<Menu
				id="EchartsSettingsMeu"
				className={classes.menu}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
					style: { backgroundColor: "#EFEFEF" },
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
					}}
				>
					<Typography sx={{ fontWeight: "600" }}>
						{t("echarts.echartsSettings.settings")}
					</Typography>
					<IconButton role="settings" onClick={handleClose}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Box>
				<MenuItem disableRipple sx={{ width: "312px", cursor: "default" }}>
					<MenuItemContent>
						<Typography> {t("echarts.echartsSettings.dataZoomSlider")}</Typography>
						<Switch size="small" checked={isDataZoom} onChange={handleSwitchDataZoom} />
					</MenuItemContent>
				</MenuItem>

				<MenuItem disableRipple sx={{ cursor: "default" }}>
					<MenuItemContent>
						<Typography>{t("echarts.echartsSettings.tooltip")}</Typography>
						<Switch size="small" checked={isAxisPointer} onChange={handleSwitchAxisPointer} />
					</MenuItemContent>
				</MenuItem>

				<MenuItem disableRipple sx={{ cursor: "default" }}>
					<MenuItemContent>
						<Typography>{t("echarts.echartsSettings.tableData")}</Typography>
						<Switch size="small" checked={showTable} onChange={handleSwitchTableData} />
					</MenuItemContent>
				</MenuItem>

				{option?.yAxis &&
					isTagSelected &&
					(option?.yAxis as INewYAxisItem[]).map((i: INewYAxisItem, index) => {
						return (
							<Box key={index} mt={1}>
								<YAxisSettings
									yAxisData={i}
									cbAutoScale={(data: EChartsOption) => handleAutoScale(i, data)}
									cbToggleYAxis={(data: EChartsOption) => handleToggleYAxis(i, data)}
									cbChangeColor={(data: EChartsOption) => handleChangeColorYAxis(i, data)}
								/>
							</Box>
						);
					})}
			</Menu>
		</Box>
	);
}

export default memo(EchartsSettings);
