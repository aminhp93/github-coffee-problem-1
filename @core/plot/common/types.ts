import { GridRowsProp } from "@mui/x-data-grid";
import type { EChartsOption } from "echarts";

export interface TagRequest {
	chainId: string;
	dataUnit: string;
	description: string;
	name: string;
	path: string;
	uuid: string;
	dataType: string;
}

export interface EnumTable {
	[key: number]: string;
}

export interface TagDataProperties {
	enumTable: EnumTable;
}

export interface Tag {
	dataType: string;
	chainId: string;
	uuid: string;
	name: string;
	description: string;
	dataUnit: string;
	path: string;
	id: string;
	min: number;
	max: number;
	avg: number;
	color: string;
	decimalNumber: number;
	dataProperties: TagDataProperties;
	hide?: boolean;
}

export interface Tags {
	[key: string]: Tag;
}

export interface DataTag {
	avg: number;
	count: number;
	interval?: string;
	max: number;
	min: number;
	ts: number;
}

export interface DataTags {
	[key: string]: DataTag[];
}

export interface Batch {
	batch: string;
	dataIndex: number;
	dataIndexInside: number;
	escapeConnect: boolean;
	notBlur: boolean;
	seriesIndex: number;
	type: string;
}

export interface EchartsHighlightParams {
	type: string;
	batch: Batch[];
}

export interface EchartsDataZoomBatch {
	start: number;
}

export interface EchartsDataZoomParams {
	batch: EchartsDataZoomBatch[];
	start: number;
	end: number;
}

export interface AddedTag {
	property: string;
	tag: Tag;
}

export interface ResponseData {
	[key: string]: {
		[key: string]: DataTag[];
	};
}

export type ExportType = "csv" | ExportImageType;

export type ExportImageType = "svg" | "png";

export interface IPMP {
	App: {
		TagExplorer2: {
			pickTags: (data: {
				maxNumberOfTags: number;
				onFinished: ((data: AddedTag[]) => void) | undefined;
			}) => void;
		};
	};
}

export interface Resolution {
	isAuto: boolean;
	value: string | undefined;
}

export type Opts = {
	renderer?: "canvas" | "svg";
};

export interface IListItem {
	name: string;
	value: number;
}

export type StartTime = {
	value: string | undefined;
	timeFrame: string | undefined;
};

export type EndTime = {
	value: string | undefined;
	timeFrame: string | undefined;
};

export type EchartsReducerActionPayload =
	| EChartsOption
	| {
			[key: string]: Tag;
	  }
	| string
	| {
			[key: string]: DataTag[];
	  }
	| Resolution
	| GridRowsProp;

export interface TimeChangeData {
	timeFrame?: string;
	dateValue?: moment.Moment;
	timeValue?: moment.Moment;
}

export interface TimeFrame {
	value: string;
	label: string;
	count: number;
	unit: string;
}

export enum TAG_DATA_TYPE {
	ENUM = "enum",
	DIGITAL = "digital",
}

export type DataRawTimeseriesResponse = Record<string, Record<string, { ts: number; v: number }[]>>;
export type FormattedData = Record<string, Record<string, { ts: number; avg: number }[]>>;
