import Box from "@mui/material/Box";
import {
	DataGridPro,
	GridRenderCellParams,
	GridColDef,
	GridRowsProp,
	GridCellParams,
} from "@mui/x-data-grid-pro";
import { GridRowModel } from "@mui/x-data-grid-pro";
import type {
	EChartsOption,
	LegendComponentOption,
	LineSeriesOption,
	DataZoomComponentOption,
} from "echarts";
import { ReactElement } from "react";
import { makeStyles } from "tss-react/mui";
import ColorPickerSelection from "../../../ColorPicker/Selection/Selection";
import { DEFAULT_WIDTH_COLUMN, INewYAxisItem } from "../../common/constants";
import LineSettings from "../LineSettings/LineSettings";
import ShowHideButton from "../ShowHideButton/ShowHideButton";
import { checkEnumDataType, hexToRGBA } from "../../common/utils";
import { dataGridProLocalization } from "../../../../utils/dataGridProLocalization";

// ** Translation Imports
import { useTranslation } from "react-i18next";

const useStyles = makeStyles()(() => {
	return {
		root: {
			"& .MuiDataGrid-columnHeader": {
				backgroundColor: "#F5F5F5",
				color: "#1D2225",
			},
			"& .MuiDataGrid-columnHeaders": {
				backgroundColor: "#F5F5F5",
				"& .MuiDataGrid-iconButtonContainer": {
					"& .MuiIconButton-root: hover": {
						backgroundColor: "unset",
					},
				},
			},
			"& .MuiDataGrid-cell.no-data-cell": {
				overflow: "visible !important",
			},
		},
		headerBarContainer: {
			display: "flex",
			justifyContent: "space-between",
		},
		button: {
			color: "#14ACFF",
			fontWeight: 600,
		},
		hiddenHeaderName: {
			color: "#F5F5F5 !important",
		},
		objectNameHeader: {
			"& .MuiDataGrid-columnHeaderTitle": {
				marginLeft: "74px",
			},
		},
		objectNameCell: {
			"& #color-picker-selection": {
				width: "20px",
				height: "20px",
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
			"& .MuiMenuItem-root": {
				paddingTop: "4px",
				paddingBottom: "4px",
			},
		},
	};
});

export interface EchartsSettingsTableProps {
	option: EChartsOption;
	rows: GridRowsProp;
	handleRemove?: (data: GridRowModel) => void;
	handleUpdateSettings?: (data: EChartsOption) => void;
}

export default function EchartsSettingsTable({
	option,
	rows,
	handleRemove,
	handleUpdateSettings,
}: EchartsSettingsTableProps): ReactElement {
	const { t } = useTranslation();
	const { classes } = useStyles();

	const columns: GridColDef[] = [
		{
			field: "object_name",
			headerName: t("echarts.echartsSettingsTable.objectName"),
			headerClassName: classes.objectNameHeader,
			minWidth: 80,
			flex: 1,
			renderCell: (data: GridRenderCellParams) => {
				return (
					<Box className={classes.objectNameCell} sx={{ display: "flex", alignItems: "center" }}>
						<ShowHideButton cb={(selected: boolean) => handleShowHideChart(data.row, selected)} />
						<ColorPickerSelection
							color={data.row.color}
							onChange={(color: string) => handleChangeColor(data.row, color)}
						/>
						<Box sx={{ marginLeft: "12px" }}>{data.row.name}</Box>
					</Box>
				);
			},
		},
		{
			field: "description",
			headerName: t("echarts.echartsSettingsTable.description"),
			minWidth: 30,
			flex: 1,
			renderCell: (data: GridRenderCellParams) => {
				return data.row.description;
			},
		},
		{
			field: "average",
			headerName: t("echarts.echartsSettingsTable.avg"),
			align: "left",
			width: DEFAULT_WIDTH_COLUMN,
			cellClassName: (data: GridCellParams) => {
				if (data.row.avg === undefined) return "no-data-cell";
				return "";
			},
			renderCell: (data: GridRenderCellParams) => {
				if (data.row.avg === undefined) {
					return t("echarts.echartsSettingsTable.no_data_available_for_given_timeframe");
				}
				const isEnumDataType = checkEnumDataType(data.row.dataType);
				if (isEnumDataType) {
					return "";
				}

				return data.row.avg && data.row.avg.toFixed(data.row.decimalNumber);
			},
		},
		{
			field: "min",
			width: DEFAULT_WIDTH_COLUMN,
			headerName: t("echarts.echartsSettingsTable.min"),
			align: "left",
			renderCell: (data: GridRenderCellParams) => {
				const isEnumDataType = checkEnumDataType(data.row.dataType);
				if (isEnumDataType) {
					return "";
				}

				return data.row.min && data.row.min.toFixed(data.row.decimalNumber);
			},
		},
		{
			field: "max",
			headerName: t("echarts.echartsSettingsTable.max"),
			align: "left",
			width: DEFAULT_WIDTH_COLUMN,
			renderCell: (data: GridRenderCellParams) => {
				const isEnumDataType = checkEnumDataType(data.row.dataType);
				if (isEnumDataType) {
					return "";
				}

				return data.row.max && data.row.max.toFixed(data.row.decimalNumber);
			},
		},
		{
			field: "unit",
			align: "left",
			width: DEFAULT_WIDTH_COLUMN,
			headerName: t("echarts.echartsSettingsTable.unit"),
			renderCell: (data: GridRenderCellParams) => {
				const isEnumDataType = checkEnumDataType(data.row.dataType);
				if (isEnumDataType) {
					return "";
				}

				return data.row.dataUnit;
			},
		},
		{
			field: "state_text",
			align: "left",
			width: 140,
			headerName: t("echarts.echartsSettingsTable.stateText"),
			renderCell: (data: GridRenderCellParams) => {
				const isEnumDataType = checkEnumDataType(data.row.dataType);
				if (!isEnumDataType || data.row.hide) {
					return "";
				}

				if (data.row.dataProperties?.enumTable) {
					const enumTable = Object.values(data.row.dataProperties?.enumTable);
					if (enumTable.length && isEnumDataType) {
						return enumTable[data.row.avg];
					}
				}

				return data.row.avg;
			},
		},
		{
			field: "setting",
			headerName: "-",
			disableColumnMenu: true,
			sortable: false,
			headerClassName: classes.hiddenHeaderName,
			width: 30,
			renderCell: (data: GridRenderCellParams) => {
				const isEnumDataType = checkEnumDataType(data.row.dataType);
				return (
					<LineSettings
						isEnumDataType={isEnumDataType}
						cb={(dataCb: EChartsOption) => handleUpdateLineSettings(data.row, dataCb)}
						cbRemove={() => handleRemove && handleRemove(data.row)}
					/>
				);
			},
		},
	];

	const handleShowHideChart = (data: GridRowModel, selected: boolean) => {
		const series = [...(option.series as LineSeriesOption[])];
		const legend = { ...(option.legend as LegendComponentOption) };

		legend.show = false;
		legend.data = series.map((i: LineSeriesOption) => {
			return i.name;
		}) as string[];
		legend.selected = {
			...legend.selected,
			[data.name]: selected,
			[`${data.name}_min`]: selected,
			[`${data.name}_max`]: selected,
		};

		const newOption = { legend };
		handleUpdateSettings && handleUpdateSettings(newOption);
	};

	const handleChangeColor = (data: GridRowModel, color: string) => {
		const series = [...(option?.series as LineSeriesOption[])];
		const index = series.findIndex((i: LineSeriesOption) => i.id === data.id);
		const indexMax = series.findIndex((i: LineSeriesOption) => i.name === `${data.name}_max`);

		if (index > -1) {
			(
				series[index] as {
					itemStyle: {
						color: string;
					};
				}
			).itemStyle = { color };

			if (indexMax > -1) {
				(
					series[indexMax] as {
						areaStyle: {
							color: string;
						};
					}
				).areaStyle = {
					color: hexToRGBA(color, 60),
				};
			}

			const newOption = { series };
			handleUpdateSettings && handleUpdateSettings(newOption);
		}
	};

	const handleUpdateLineSettings = (data: GridRowModel, dataCb: EChartsOption) => {
		const yAxis = [...(option.yAxis as INewYAxisItem[])];
		const indexYAxis = yAxis.findIndex((i: INewYAxisItem) => i.name === data.dataUnit);
		const legend = { ...(option.legend as LegendComponentOption) };
		let dataZoom = [...(option.dataZoom as DataZoomComponentOption[])];
		let tooltip = { ...option.tooltip };

		if (dataCb.tooltip) {
			tooltip = { ...option.tooltip, ...dataCb.tooltip };
		}

		if (indexYAxis > -1) {
			yAxis[indexYAxis] = { ...yAxis[indexYAxis], ...dataCb.yAxis } as INewYAxisItem;
		}

		let series = [...(option.series as LineSeriesOption[])];
		const indexSeries = series.findIndex((i: LineSeriesOption) => i.id === data.id);

		if (indexSeries > -1) {
			// Hide min and max line chart if type change from Bar to Line
			if (dataCb.series) {
				if (
					(
						dataCb.series as {
							type: string;
						}
					).type === "bar" ||
					(
						dataCb.series as {
							type: string;
						}
					).type === "scatter"
				) {
					legend.show = false;
					legend.data = series.map((i: LineSeriesOption) => {
						return i.name;
					}) as string[];
					legend.selected = {
						...legend.selected,
						[`${data.name}`]: true,
						[`${data.name}_min`]: false,
						[`${data.name}_max`]: false,
					};

					// Change dataZoom filterMode to filter if type change from Line to Bar
					dataZoom.forEach(i => {
						i.filterMode = "filter";
					});
				} else if ((dataCb.series as LineSeriesOption).type === "line") {
					legend.show = false;
					legend.data = series.map((i: LineSeriesOption) => {
						return i.name;
					}) as string[];
					legend.selected = {
						...legend.selected,
						[`${data.name}`]: true,
						[`${data.name}_min`]: true,
						[`${data.name}_max`]: true,
					};

					// Change dataZoom filterMode to filter if type change from Bar to Line
					if (
						series.filter(
							i =>
								(
									i as {
										type: string;
									}
								).type === "bar"
						).length === 1 ||
						series.filter(
							i =>
								(
									i as {
										type: string;
									}
								).type === "scatter"
						).length === 1
					) {
						dataZoom.forEach(i => {
							i.filterMode = "none";
						});
					}
				}

				(dataCb.series as LineSeriesOption).itemStyle = {
					color: (
						series[indexSeries] as {
							itemStyle: {
								color: string;
							};
						}
					).itemStyle.color,
				};
			}

			series[indexSeries] = { ...series[indexSeries], ...dataCb.series } as LineSeriesOption;

			if (dataCb && dataCb.hasOwnProperty("decimalNumber")) {
				(
					series[indexSeries] as {
						decimalNumber: number;
					}
				).decimalNumber = dataCb.decimalNumber as number;
			}
		}

		const newOption = { yAxis, series, legend, tooltip, dataZoom };
		handleUpdateSettings && handleUpdateSettings(newOption);
	};

	return (
		<Box style={{ height: "100%", width: "100%" }}>
			<DataGridPro
				className={classes.root}
				headerHeight={40}
				rowHeight={40}
				rows={rows}
				columns={columns}
				hideFooter
				localeText={dataGridProLocalization}
			/>
		</Box>
	);
}
