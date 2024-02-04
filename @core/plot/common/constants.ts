import type {
	DataZoomComponentOption,
	EChartsOption,
	GridComponentOption,
	LineSeriesOption,
	ToolboxComponentOption,
	TooltipComponentOption,
	XAXisComponentOption,
	YAXisComponentOption,
} from "echarts";
import moment from "moment";
import { getFormatterTooltip } from "./utils";
import { keyBy } from "lodash";
import i18next from "i18next";

export const DATE_FORMAT = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm:ss";
export const HOUR_MINUTE_FORMAT = "HH:mm";
export const DATE_TIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;
export const DATE_TIME_FORMAT_GET_VALUE = "YYYY-MM-DDTHH:mm:ss";
export const DAY_FORMAT = "dddd";
export const COLORS = [
	"#5470c6",
	"#91cc75",
	"#fac858",
	"#ee6666",
	"#73c0de",
	"#3ba272",
	"#fc8452",
	"#9a60b4",
	"#ea7ccc",
];
export const DEFAULT_WIDTH_COLUMN = 100;
export const DEFAULT_MIN_YAXIS = 0;
export const DEFAULT_MAX_YAXIS = 100;
export const DEFAULT_DECIMAL_NUMBER = 2;
export const MIN_PERCENT_UPDATE_SLIDER = 2;
export const DEFAULT_Y_AXIS_POSITION = "left";
export const NUMBER_CALL_API_INTERVAL = 10;

export const LIST_RESOLUTION = [
	{
		value: "auto",
		label: i18next.t("echarts.utils.auto"),
	},
	{
		value: "1s",
		label: "1s",
	},
	{
		value: "5s",
		label: "5s",
	},
	{
		value: "15s",
		label: "15s",
	},
	{
		value: "30s",
		label: "30s",
	},
	{
		value: "1m",
		label: "1m",
	},
	{
		value: "2m",
		label: "2m",
	},
	{
		value: "3m",
		label: "3m",
	},
	{
		value: "5m",
		label: "5m",
	},
	{
		value: "10m",
		label: "10m",
	},
	{
		value: "12m",
		label: "12m",
	},
	{
		value: "15m",
		label: "15m",
	},
	{
		value: "20m",
		label: "20m",
	},
	{
		value: "30m",
		label: "30m",
	},
	{
		value: "1h",
		label: "1h",
	},
	{
		value: "2h",
		label: "2h",
	},
	{
		value: "3h",
		label: "3h",
	},
	{
		value: "4h",
		label: "4h",
	},
	{
		value: "6h",
		label: "6h",
	},
	{
		value: "8h",
		label: "8h",
	},
	{
		value: "12h",
		label: "12h",
	},
	{
		value: "1d",
		label: "1d",
	},
	{
		value: "2d",
		label: "2d",
	},
];

export const DEFAULT_RESOLUTION = LIST_RESOLUTION[0];

export const LIST_START_TIME_FRAME = [
	{
		value: "last_15_mins",
		label: i18next.t("echarts.utils.last_n_minutes", { n: 15 }),
		count: 15,
		unit: "minutes",
	},
	{
		value: "last_30_mins",
		label: i18next.t("echarts.utils.last_n_minutes", { n: 30 }),
		count: 30,
		unit: "minutes",
	},
	{
		value: "last_hour",
		label: i18next.t("echarts.utils.last_hour"),
		count: 1,
		unit: "hours",
	},
	{
		value: "last_2_hours",
		label: i18next.t("echarts.utils.last_n_hours", { n: 2 }),
		count: 2,
		unit: "hours",
	},
	{
		value: "last_4_hours",
		label: i18next.t("echarts.utils.last_n_hours", { n: 4 }),
		count: 4,
		unit: "hours",
	},
	{
		value: "last_6_hours",
		label: i18next.t("echarts.utils.last_n_hours", { n: 6 }),
		count: 6,
		unit: "hours",
	},
	{
		value: "last_12_hours",
		label: i18next.t("echarts.utils.last_n_hours", { n: 12 }),
		count: 12,
		unit: "hours",
	},
	{
		value: "last_day",
		label: i18next.t("echarts.utils.last_day"),
		count: 1,
		unit: "days",
	},
	{
		value: "last_2_days",
		label: i18next.t("echarts.utils.last_n_days", { n: 2 }),
		count: 2,
		unit: "days",
	},
	{
		value: "last_3_days",
		label: i18next.t("echarts.utils.last_n_days", { n: 3 }),
		count: 3,
		unit: "days",
	},
	{
		value: "last_4_days",
		label: i18next.t("echarts.utils.last_n_days", { n: 4 }),
		count: 4,
		unit: "days",
	},
	{
		value: "last_5_days",
		label: i18next.t("echarts.utils.last_n_days", { n: 5 }),
		count: 5,
		unit: "days",
	},
	{
		value: "last_6_days",
		label: i18next.t("echarts.utils.last_n_days", { n: 6 }),
		count: 6,
		unit: "days",
	},
	{
		value: "last_week",
		label: i18next.t("echarts.utils.last_week"),
		count: 7,
		unit: "days",
	},
	{
		value: "last_x_weeks",
		label: i18next.t("echarts.utils.last_n_weeks", { n: 2 }),
		count: 14,
		unit: "days",
	},
	{
		value: "last_x_weeks_2",
		label: i18next.t("echarts.utils.last_n_weeks", { n: 3 }),
		count: 21,
		unit: "days",
	},
	{
		value: "last_month",
		label: i18next.t("echarts.utils.last_month"),
		count: 30,
		unit: "days",
	},
	{
		value: "last_3_months",
		label: i18next.t("echarts.utils.last_n_months", { n: 3 }),
		count: 1 * 30 * 3,
		unit: "days",
	},
	{
		value: "last_6_months",
		label: i18next.t("echarts.utils.last_n_months", { n: 6 }),
		count: 1 * 30 * 6,
		unit: "days",
	},
	{
		value: "last_year",
		label: i18next.t("echarts.utils.last_year"),
		count: 1 * 30 * 12,
		unit: "days",
	},
	{
		value: "last_18_months",
		label: i18next.t("echarts.utils.last_n_months", { n: 18 }),
		count: 1 * 30 * 18,
		unit: "days",
	},
];

export const LIST_END_TIME_FRAME = [
	{
		value: "next_15_mins",
		label: i18next.t("echarts.utils.n_minutes", { n: 15 }),
		count: 15,
		unit: "minutes",
	},
	{
		value: "next_30_mins",
		label: i18next.t("echarts.utils.n_minutes", { n: 30 }),
		count: 15,
		unit: "minutes",
	},
	{
		value: "next_hour",
		label: i18next.t("echarts.utils.hour"),
		count: 1,
		unit: "hours",
	},
	{
		value: "next_2_hours",
		label: i18next.t("echarts.utils.n_hours", { n: 2 }),
		count: 2,
		unit: "hours",
	},
	{
		value: "next_4_hours",
		label: i18next.t("echarts.utils.n_hours", { n: 4 }),
		count: 4,
		unit: "hours",
	},
	{
		value: "next_6_hours",
		label: i18next.t("echarts.utils.n_hours", { n: 6 }),
		count: 6,
		unit: "hours",
	},
	{
		value: "next_12_hours",
		label: i18next.t("echarts.utils.n_hours", { n: 12 }),
		count: 12,
		unit: "hours",
	},
	{
		value: "next_day",
		label: i18next.t("echarts.utils.day"),
		count: 1,
		unit: "days",
	},
	{
		value: "next_2_days",
		label: i18next.t("echarts.utils.n_days", { n: 2 }),
		count: 2,
		unit: "days",
	},
	{
		value: "next_3_days",
		label: i18next.t("echarts.utils.n_days", { n: 3 }),
		count: 3,
		unit: "days",
	},
	{
		value: "next_4_days",
		label: i18next.t("echarts.utils.n_days", { n: 4 }),
		count: 4,
		unit: "days",
	},
	{
		value: "next_5_days",
		label: i18next.t("echarts.utils.n_days", { n: 5 }),
		count: 5,
		unit: "days",
	},
	{
		value: "next_6_days",
		label: i18next.t("echarts.utils.n_days", { n: 6 }),
		count: 6,
		unit: "days",
	},
	{
		value: "next_week",
		label: i18next.t("echarts.utils.week"),
		count: 7,
		unit: "days",
	},
	{
		value: "next_x_weeks",
		label: i18next.t("echarts.utils.n_weeks", { n: 2 }),
		count: 14,
		unit: "days",
	},
	{
		value: "next_x_weeks_2",
		label: i18next.t("echarts.utils.n_weeks", { n: 3 }),
		count: 21,
		unit: "days",
	},
	{
		value: "next_month",
		label: i18next.t("echarts.utils.month"),
		count: 30,
		unit: "days",
	},
	{
		value: "next_3_months",
		label: i18next.t("echarts.utils.n_months", { n: 3 }),
		count: 1 * 30 * 3,
		unit: "days",
	},
	{
		value: "next_6_months",
		label: i18next.t("echarts.utils.n_months", { n: 6 }),
		count: 1 * 30 * 6,
		unit: "days",
	},
	{
		value: "next_year",
		label: i18next.t("echarts.utils.year"),
		count: 1 * 30 * 12,
		unit: "days",
	},
	{
		value: "next_18_months",
		label: i18next.t("echarts.utils.n_months", { n: 18 }),
		count: 1 * 30 * 18,
		unit: "days",
	},
];

export const DEFAULT_START_TIME_FRAME = LIST_START_TIME_FRAME[7];
export const DEFAULT_END_TIME_FRAME = LIST_END_TIME_FRAME[7];

export const OBJ_START_TIME_FRAME = keyBy(LIST_START_TIME_FRAME, "value");
export const OBJ_END_TIME_FRAME = keyBy(LIST_END_TIME_FRAME, "value");
export const ENUM_UNIT = "ENUM_UNIT";
export const DEFAULT_YAXIS_NAME = "default_Yaxis";

export const TOOLTIP_OPTION: TooltipComponentOption = {
	trigger: "axis",
	axisPointer: {
		type: "cross",
	},
	// transitionDuration: 0,
	showContent: true,
	formatter: (data: unknown) => {
		return getFormatterTooltip(data, DEFAULT_DECIMAL_NUMBER);
	},
};

export const GRID_OPTION: GridComponentOption = {
	top: "30px",
	left: "40px",
	right: "40px",
	bottom: "100px",
};

export const DATAZOOM_OPTION: DataZoomComponentOption[] = [
	{
		type: "slider",
		show: true,
		realtime: true,
		start: 10,
		end: 100,
		height: 20,
		left: 120,
		right: 200,
		filterMode: "none",
		labelFormatter: (value: number): string => {
			return moment(value).format(DATE_TIME_FORMAT);
		},
	},
	{
		type: "inside",
		realtime: true,
		start: 10,
		end: 100,
		filterMode: "none",
		disabled: false,
	},
];

export const TOOLBOX_OPTION: ToolboxComponentOption = {
	bottom: 16,
	right: -30,
	show: true,
	feature: {
		dataZoom: {
			yAxisIndex: "none",
			title: {
				zoom: "",
				back: "",
			},
		},
	},
	itemGap: 40,
	padding: 2,
	itemSize: 20,
};

export const DEFAULT_XAXIS: XAXisComponentOption = {
	type: "time",
	axisLabel: {
		formatter: (value: string) => {
			return (
				`{hour|${moment(value).format(TIME_FORMAT)}}` +
				"\n" +
				`{date|${moment(value).format(DATE_FORMAT)}}` +
				"\n" +
				`{day|${moment(value).format(DAY_FORMAT)}}`
			);
		},
		rich: {
			hour: {
				color: "#1E294B",
				opacity: 0.6,
			},
			date: {
				color: "#1E294B",
				opacity: 0.8,
				fontWeight: 700,
				padding: [4, 0, 4, 0],
			},
			day: {
				color: "#1E294B",
				opacity: 0.6,
			},
		},
	},
	alignTicks: true,
	axisPointer: {
		label: {
			formatter: (data: unknown) => {
				return moment(
					(
						data as {
							value: number;
						}
					).value
				).format(DATE_TIME_FORMAT);
			},
		},
	},
	offset: 0,
	splitNumber: 4,
	splitLine: {
		show: true,
		lineStyle: {
			color: "#1E294B",
			opacity: 0.6,
		},
	},
};

export type INewYAxisItem = YAXisComponentOption & {
	yAxisId?: string;
	yAxisType?: string;
	axisLabel?: {
		overflow?: "truncate" | "break" | "breakAll" | "none";
	};
	yAxisEnum?: string[];
};

export const DEFAULT_YAXIS: INewYAxisItem = {
	type: "value",
	alignTicks: false,
	nameTextStyle: {
		color: "#1E294B",
		opacity: 0.6,
	},
	axisLabel: {
		color: "#1E294B",
	},
	splitNumber: 8,
	splitLine: {
		show: true,
		lineStyle: {
			color: "#1E294B",
			opacity: 0.6,
		},
	},
	axisPointer: {
		label: {
			formatter: (data: unknown) => {
				return (
					data as {
						value: number;
					}
				).value.toFixed(2);
			},
		},
	},
	position: "left",
	scale: true,
	min: undefined,
	max: undefined,
};

export const DEFAULT_LINE_SERIES: LineSeriesOption & {
	decimalNumber?: number;
} = {
	type: "line",
	smooth: true,
	markLine: {
		symbol: ["none", "none"],
		label: { show: false },
		lineStyle: {
			color: "#1E294B",
			type: "solid",
		},
	},
	triggerLineEvent: true,
	connectNulls: true,
	decimalNumber: DEFAULT_DECIMAL_NUMBER,
	stackStrategy: "all",
	lineStyle: {
		width: 2,
	},
};

export const DEFAULT_OPTION: EChartsOption = {
	legend: {
		show: false,
	},
	animation: false,
	xAxis: {
		...DEFAULT_XAXIS,
		min: Number(moment().add(-12, "hours").format("x")),
		max: Number(moment().format("x")),
	},
	yAxis: [
		{
			...DEFAULT_YAXIS,
			min: 0,
			max: 120,
			name: DEFAULT_YAXIS_NAME,
			nameTextStyle: {
				color: "white",
			},
			id: 1,
		},
	],
	series: [],
	tooltip: TOOLTIP_OPTION,
	grid: GRID_OPTION,
	toolbox: TOOLBOX_OPTION,
	dataZoom: DATAZOOM_OPTION,
	color: COLORS,
	backgroundColor: "white",
	textStyle: {
		color: "#B9B8CE",
		fontFamily: "sans-serif",
		fontSize: "12",
		fontStyle: "normal",
		fontWeight: "normal",
	},
};

export const DEFAULT_YAXIS_OFFSET = 50;
export const ENUM_YAXIS_OFFSET = 70;

export const DIGITAL_ENUM_TABLE = {
	0: "0",
	1: "1",
};
