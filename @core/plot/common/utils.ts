import type {
	DataZoomComponentOption,
	EChartsOption,
	GridComponentOption,
	LineSeriesOption,
} from "echarts";
import { getInstanceByDom } from "echarts";
import { difference, get, groupBy, isEqual, keyBy, uniq, flatMap } from "lodash";
import moment, { DurationInputArg2 } from "moment";
import { RefObject, useEffect, useRef, useState } from "react";
import {
	COLORS,
	DATE_TIME_FORMAT,
	DEFAULT_LINE_SERIES,
	DEFAULT_YAXIS,
	DEFAULT_YAXIS_NAME,
	DEFAULT_YAXIS_OFFSET,
	DIGITAL_ENUM_TABLE,
	ENUM_UNIT,
	ENUM_YAXIS_OFFSET,
	INewYAxisItem,
	LIST_END_TIME_FRAME,
	MIN_PERCENT_UPDATE_SLIDER,
	OBJ_END_TIME_FRAME,
	OBJ_START_TIME_FRAME,
} from "./constants";
import {
	DataRawTimeseriesResponse,
	DataTag,
	DataTags,
	EndTime,
	EnumTable,
	ExportImageType,
	FormattedData,
	IListItem,
	ResponseData,
	StartTime,
	TAG_DATA_TYPE,
	Tag,
	TagDataProperties,
	Tags,
	TimeChangeData,
} from "./types";

export const checkEnumDataType = (dataType: string) => {
	return dataType === TAG_DATA_TYPE.ENUM || dataType === TAG_DATA_TYPE.DIGITAL;
};

export const getFormatterTooltip = (data: unknown, decimal: number): string => {
	interface IData {
		seriesName: string;
		value: Array<number | string>;
		marker: string;
		axisValueLabel: string;
	}

	//tooltip is only showed data that is not max min area data
	let validData = (data as IData[]).filter((i: IData) => !i.seriesName.match(/(_min|_max)$/));

	let result = "";
	const showedData: IData[] = [];
	const group = groupBy(validData, "seriesName");

	Object.values(group).forEach(item => {
		showedData.push(item[0]);
	});

	showedData.forEach((i: IData, index: number) => {
		result += `<div>`;
		const time = i.axisValueLabel;
		if (index === 0) {
			result += `<div>${time}</div>`;
		}
		const name = i.seriesName;
		const value =
			i.value && i.value[1] && typeof i.value[1] !== "number"
				? i.value[1]
				: Number(i.value[1]).toFixed(decimal);
		const unit = (i.value && i.value[2]) || "";
		let text = `${value} ${unit}`;

		if ((unit as string).includes(ENUM_UNIT)) {
			//slice 10 is remove prefix ENUM_UNIT
			text = (unit as string).replace(ENUM_UNIT, "");
		}
		result += `<div style="display:flex; justify-content: space-between;">
				<div style="margin-right:10px">${i.marker} ${name}</div>
				<div style="font-weight:600; margin-left: 20px"> ${text}</div>
			</div>`;
		result += "</div>";
	});
	return result;
};

export const hexToRGBA = (hexColor: string, opacity: number): string => {
	if (!hexColor) return hexColor;
	let r, g, b;
	hexColor = hexColor.replace("#", "");
	r = parseInt(hexColor.substring(0, hexColor.length / 3), 16);
	g = parseInt(hexColor.substring(hexColor.length / 3, 2 * (hexColor.length / 3)), 16);
	b = parseInt(hexColor.substring((2 * hexColor.length) / 3, 3 * (hexColor.length / 3)), 16);
	return "rgba(" + r + "," + g + "," + b + "," + opacity / 255 + ")";
};

export function useIsFirstRender(): boolean {
	const isFirst = useRef(true);

	if (isFirst.current) {
		isFirst.current = false;

		return true;
	}

	return isFirst.current;
}

export function useDebounce<T>(value: T, delay?: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}

export const getNewRows = (
	valuesTags: Tag[],
	updatedDataTags: DataTags,
	list: IListItem[]
): Tag[] => {
	return valuesTags.map((i: Tag) => {
		i.id = i.uuid;
		i.hide = false;
		if (updatedDataTags && updatedDataTags[i.uuid]) {
			const itemList = list.filter((j: IListItem) => j.name === i.name);
			const itemList_min = list.filter((j: IListItem) => j.name === `${i.name}_min`);
			const itemList_max = list.filter((j: IListItem) => j.name === `${i.name}_max`);

			if (itemList.length === 1) {
				i.avg = itemList[0].value;
			}

			if (itemList_min.length === 1) {
				i.min = itemList_min[0].value;
			}

			if (itemList_max.length === 1) {
				i.max = itemList_max[0].value + i.min;
			}
		}

		return i;
	});
};

export const getNewDataZoom = (
	oldDataZoom: DataZoomComponentOption[]
): DataZoomComponentOption[] => {
	const insideDataZoomIndex = oldDataZoom.findIndex(i => i.type === "inside");
	const sliderDataZoomIndex = oldDataZoom.findIndex(i => i.type === "slider");
	if (insideDataZoomIndex === -1 || sliderDataZoomIndex === -1) return oldDataZoom;

	const insideDataZoom = oldDataZoom[insideDataZoomIndex];
	const sliderDataZoom = oldDataZoom[sliderDataZoomIndex];

	let start: number | undefined = insideDataZoom.start;
	let end: number | undefined = insideDataZoom.end;
	if ((start || start === 0) && start < MIN_PERCENT_UPDATE_SLIDER && (end || end === 0)) {
		start = start + MIN_PERCENT_UPDATE_SLIDER;
		end = end + MIN_PERCENT_UPDATE_SLIDER;
	}

	return [
		{
			...insideDataZoom,
			start,
			end,
		},
		{
			...sliderDataZoom,
			start,
			end,
		},
	];
};

export const getStep = (type: string): false | "start" | "middle" | "end" | undefined => {
	return type === "enum" || type === "digital" ? "start" : false;
};

export const getInterval = (data: DataTag[][]) => {
	const filteredData = data.filter(i => i.length > 0);
	const flattenData = filteredData.flat();
	const intervalList = flattenData.filter(i => i.interval);
	return get(intervalList, "[0].interval");
};

export const getXAxis = ({
	option,
	startTime,
	endTime,
}: {
	option: EChartsOption;
	startTime: string;
	endTime: string;
}) => {
	return {
		...option?.xAxis,
		min: Number(moment(startTime).format("x")),
		max: Number(moment(endTime).format("x")),
	};
};

const filteredDataEnum = (rawData: DataTag[]) => {
	const filterData: DataTag[] = [];
	rawData.forEach((tag: DataTag, index: number) => {
		if (tag.ts) {
			filterData.push(tag);
		}
	});

	return filterData;
};

const filterNonEnumData = (rawData: DataTag[]) => {
	const groupedByTs = groupBy(rawData, "ts");
	const uniqueArray = flatMap(groupedByTs, group => {
		if (group.length === 1) {
			return group;
		} else {
			return group[1]; // Keep the second value when not unique
		}
	});

	return uniqueArray;
};

const convertDataEnum = (rawData: DataTag[], enumTable: TagDataProperties) => {
	const listKey = Object.keys(enumTable.enumTable);
	rawData.forEach((tag: DataTag) => {
		const avgIndex = listKey.findIndex(i => Number(i) === tag.avg);
		if (avgIndex !== -1) {
			tag.avg = avgIndex;
		}
	});
};

export const getYAxisAndSeries = ({
	option,
	dataChainId,
	tags,
}: {
	option: EChartsOption;
	dataChainId: {
		[key: string]: DataTag[];
	};
	tags: Tags;
}) => {
	const series = [...(option.series as LineSeriesOption[])];
	const yAxis = [...(option.yAxis as INewYAxisItem[])];

	// Remove default yAxis
	const defaultYAxisIndex = yAxis.findIndex(i => i.name === DEFAULT_YAXIS_NAME);
	if (defaultYAxisIndex > -1) {
		yAxis.splice(defaultYAxisIndex, 1);
	}

	Object.keys(dataChainId).forEach((key: string) => {
		const tag = tags[key];
		const isEnumDataType = checkEnumDataType(tag.dataType);
		// Find existing line chart
		const indexSeries = series.findIndex((i: LineSeriesOption) => i.name === tag.name);

		let mainLineDataShow = (series as LineSeriesOption[]).filter(
			(i: LineSeriesOption) => !(i?.name as string)?.match(/(_min|_max)$/)
		);
		const listColorExit = mainLineDataShow.map(i => i.itemStyle?.color);
		const colorDiff = difference(COLORS, listColorExit);
		let color = (colorDiff[0] || COLORS[0]) as string;

		let listEnum: string[] = [];
		let indexYAxis = yAxis.findIndex(i => i.name === tag.dataUnit && i.yAxisType === tag.dataType);

		if (isEnumDataType) {
			listEnum = Object.values(tag?.dataProperties?.enumTable);
			const listEnumSorted = [...listEnum].sort();
			// Find existing yAxis enum
			indexYAxis = yAxis.findIndex(i => {
				const listYAxisEnumSorted = i.yAxisEnum && [...i.yAxisEnum].sort();
				return isEqual(listYAxisEnumSorted, listEnumSorted);
			});
			convertDataEnum(dataChainId[key], tag?.dataProperties);
		}

		if (indexSeries > -1) {
			let dataChainIdByKey = filterNonEnumData(dataChainId[key]);

			// If index found, update data in option chart
			const indexMin = series.findIndex((i: LineSeriesOption) => i.name === `${tag.name}_min`);
			const indexMax = series.findIndex((i: LineSeriesOption) => i.name === `${tag.name}_max`);

			if (indexMin > -1) {
				series[indexMin].data = dataChainIdByKey.map((i: DataTag) => {
					return [i.ts, i.min];
				});
			}

			if (indexMax > -1) {
				series[indexMax].data = dataChainIdByKey.map((i: DataTag) => {
					return [i.ts, i.max - i.min];
				});
			}

			if (isEnumDataType) {
				dataChainIdByKey = filteredDataEnum(dataChainId[key]);
			}

			series[indexSeries].data = dataChainIdByKey.map((i: DataTag) => {
				const unit = isEnumDataType ? ENUM_UNIT + listEnum[i.avg] : tag.dataUnit;

				return [i.ts, i.avg, unit];
			});
		} else {
			if (!tag.dataUnit) {
				tag.dataUnit = "";
			}
			// Check if new chart has new dataUnit with data type is enum and check yAxis exited in chart or not
			if (isEnumDataType && indexYAxis === -1) {
				yAxis.push({
					...DEFAULT_YAXIS,
					yAxisId: tag.uuid,
					yAxisType: tag.dataType,
					yAxisEnum: listEnum,
					name: "",
					nameTextStyle: { color },
					splitLine: {
						lineStyle: {
							opacity: 0,
						},
					},
					axisPointer: {
						label: {
							show: false,
						},
					},
					interval: 1,
					axisLabel: {
						color,
						width: ENUM_YAXIS_OFFSET,
						rotate: 45,
						fontSize: 9,
						overflow: "breakAll",
						formatter: (data: number) => {
							return listEnum[data];
						},
					},
					axisLine: {
						show: true,
						lineStyle: { color },
					},
					min: 0,
					max: listEnum.length - 1,
				} as INewYAxisItem);
			} else {
				// Check if new chart has new dataUnit
				if (indexYAxis === -1) {
					// If not, create new one
					yAxis.push({
						...DEFAULT_YAXIS,
						yAxisId: tag.uuid,
						yAxisType: tag.dataType,
						name: tag.dataUnit,
						splitLine: {
							lineStyle: {
								opacity: 0,
							},
						},
						nameTextStyle: { color },
						axisLabel: {
							color,
							width: DEFAULT_YAXIS_OFFSET,
							overflow: "truncate",
						},
						axisLine: {
							show: true,
							lineStyle: { color },
						},
					});
				}
			}

			const step = getStep(tag.dataType);
			let yAxisIndex;

			if (indexYAxis > -1) {
				yAxisIndex = indexYAxis;
			} else {
				if (yAxis.length === 0) {
					//
				} else {
					yAxisIndex = yAxis.length - 1;
				}
			}

			const newDefaultSeries: LineSeriesOption = {
				...DEFAULT_LINE_SERIES,
				step,
				yAxisIndex,
			};

			if (!isEnumDataType) {
				const filteredNonEnumData = filterNonEnumData(dataChainId[key]);
				series.push({
					...newDefaultSeries,
					name: `${tag.name}_min`,
					data: filteredNonEnumData.map((i: DataTag) => {
						return [i.ts, i.min];
					}),
					lineStyle: {
						opacity: 0,
					},
					stack: `${tag.name}_stack`,
					symbol: "none",
					showSymbol: false,
				});

				series.push({
					...newDefaultSeries,
					name: `${tag.name}_max`,
					data: filteredNonEnumData.map((i: DataTag) => {
						return [i.ts, i.max - i.min];
					}),
					lineStyle: {
						opacity: 0,
					},
					areaStyle: {
						color: hexToRGBA(color, 60),
					},
					stack: `${tag.name}_stack`,
					symbol: "none",
					showSymbol: false,
				});

				series.push({
					...newDefaultSeries,
					id: tag.uuid,
					name: tag.name,
					data: filteredNonEnumData.map((i: DataTag) => {
						const unit = isEnumDataType ? ENUM_UNIT + listEnum[i.avg] : tag.dataUnit;
						return [i.ts, i.avg, unit];
					}),
					itemStyle: {
						color,
					},
				});
			} else {
				series.push({
					...newDefaultSeries,
					id: tag.uuid,
					name: tag.name,
					data: filteredDataEnum(dataChainId[key]).map((i: DataTag) => {
						const unit = isEnumDataType ? ENUM_UNIT + listEnum[i.avg] : tag.dataUnit;
						return [i.ts, i.avg, unit];
					}),
					step: "end",
					itemStyle: {
						color,
					},
				});
			}
		}
	});

	const allYAxisIsEnum = yAxis.every(i => checkEnumDataType(i.yAxisType!));
	if (allYAxisIsEnum) {
		const yAxisLongest = Math.max(...yAxis.map(i => i.max as number));
		yAxis.forEach((i, index) => {
			if (yAxisLongest === i.max) {
				yAxis[index].splitLine = {
					lineStyle: {
						color: "#000",
						opacity: 1,
					},
				};
			}
		});
	} else {
		for (let i = 0; i < yAxis.length; i++) {
			if (!checkEnumDataType(yAxis[i].yAxisType!)) {
				yAxis[i].splitLine = {
					lineStyle: {
						color: "#000",
						opacity: 1,
					},
				};
				break;
			}
		}
	}

	// set offset of yAxis
	const { offsetLeft, offsetRight } = setOffsetYAxis(yAxis);

	return {
		yAxis,
		series,
		offsetLeft,
		offsetRight,
	};
};

export const exportImage = (
	chartRef: RefObject<HTMLDivElement> | undefined,
	type: ExportImageType
) => {
	if (!chartRef || !chartRef.current) return;
	const chart = getInstanceByDom(chartRef.current);
	const imgUrl = chart?.getDataURL({
		type,
		pixelRatio: 2,
		backgroundColor: "#fff",
	});
	if (!imgUrl) return;

	let tempA = document.createElement("a");
	tempA.download = `echarts download.${type}`;
	tempA.href = imgUrl;
	document.body.appendChild(tempA);
	tempA.click();
	tempA.remove();
};

export const getGrid = ({
	grid,
	offsetRight,
	offsetLeft,
}: {
	grid: GridComponentOption;
	offsetRight: number;
	offsetLeft: number;
}) => {
	return {
		...grid,
		left: offsetLeft,
		right: offsetRight,
	};
};

export const getRows = ({
	tags,
	option,
	dataTags,
	checkEnumType,
}: {
	tags: Tags;
	option: EChartsOption;
	dataTags: DataTags;
	checkEnumType: boolean;
}) => {
	const valuesTags = Object.values(tags);
	const keyBySeries = keyBy(option.series || [], "id") || {};
	return valuesTags.map((i: Tag) => {
		i.id = i.uuid;
		if (dataTags && dataTags[i.uuid] && dataTags[i.uuid].length) {
			i.min = dataTags[i.uuid][0].min;
			i.max = dataTags[i.uuid][0].max;
			i.avg = dataTags[i.uuid][0].avg;
			i.hide = checkEnumType && checkEnumDataType(i.dataType) ? true : false;
			i.color = (
				keyBySeries[i.id] as {
					itemStyle: {
						color: string;
					};
				}
			)?.itemStyle?.color;
			i.decimalNumber = (
				keyBySeries[i.id] as {
					decimalNumber: number;
				}
			)?.decimalNumber;
		}
		return i;
	});
};

export const getStartEndTime = ({
	startTime,
	endTime,
}: {
	startTime: StartTime;
	endTime: EndTime;
}) => {
	let start;
	let end;
	if (!startTime.timeFrame) {
		start = moment(startTime.value).format(DATE_TIME_FORMAT);

		if (!endTime.timeFrame) {
			end = moment(endTime.value).format(DATE_TIME_FORMAT);
		} else {
			const COUNT = OBJ_END_TIME_FRAME[endTime.timeFrame].count;
			const UNIT = OBJ_END_TIME_FRAME[endTime.timeFrame].unit as DurationInputArg2;
			end = moment(startTime.value).add(COUNT, UNIT).format(DATE_TIME_FORMAT);
		}
	} else {
		const COUNT = OBJ_START_TIME_FRAME[startTime.timeFrame].count;
		const UNIT = OBJ_START_TIME_FRAME[startTime.timeFrame].unit as DurationInputArg2;
		start = moment().add(-COUNT, UNIT).format(DATE_TIME_FORMAT);
		end = moment().format(DATE_TIME_FORMAT);
	}
	return {
		start,
		end,
	};
};

const getValueDateTime = (value: moment.Moment | undefined, key: "dateValue" | "timeValue") => {
	if (!value) return;
	if (key === "dateValue") {
		const year = value.year();
		const month = value.month();
		const date = value.date();

		return value
			.set({
				year,
				month,
				date,
			})
			.format(DATE_TIME_FORMAT);
	}
	if (key === "timeValue") {
		const hour = value.hour();
		const minute = value.minute();
		return moment(value)
			.set({
				hour,
				minute,
			})
			.format(DATE_TIME_FORMAT);
	}
};

export const validateTime = ({
	startTime,
	endTime,
	data,
}: {
	startTime: StartTime;
	endTime: EndTime;
	data: {
		startTime?: TimeChangeData;
		endTime?: TimeChangeData;
	};
}) => {
	if (data.startTime) {
		if (data.startTime.hasOwnProperty("dateValue")) {
			const newValue = getValueDateTime(data.startTime.dateValue, "dateValue");
			if (newValue) {
				startTime.value = newValue;
				startTime.timeFrame = undefined;
			}

			if (startTime.timeFrame) {
				endTime.timeFrame = LIST_END_TIME_FRAME[6].value;
			}
		}

		if (data.startTime.hasOwnProperty("timeValue")) {
			const newValue = getValueDateTime(data.startTime.timeValue, "timeValue");
			if (newValue) {
				startTime.value = newValue;
				startTime.timeFrame = undefined;
			}

			if (startTime.timeFrame) {
				endTime.timeFrame = LIST_END_TIME_FRAME[6].value;
			}
		}

		if (data.startTime.hasOwnProperty("timeFrame")) {
			startTime.timeFrame = data.startTime.timeFrame;
			const { start, end } = getStartEndTime({
				startTime,
				endTime,
			});
			startTime.value = start;
			endTime.value = end;
			endTime.timeFrame = undefined;
		}
	}

	if (data.endTime) {
		if (data.endTime.hasOwnProperty("dateValue")) {
			const newValue = getValueDateTime(data.endTime.dateValue, "dateValue");
			if (newValue) {
				endTime.value = newValue;
				endTime.timeFrame = undefined;
			}
		}

		if (data.endTime.hasOwnProperty("timeValue")) {
			const newValue = getValueDateTime(data.endTime.timeValue, "timeValue");
			if (newValue) {
				endTime.value = newValue;
				endTime.timeFrame = undefined;
			}
		}

		if (data.endTime.hasOwnProperty("timeFrame")) {
			endTime.timeFrame = data.endTime.timeFrame;
			const { end } = getStartEndTime({
				startTime,
				endTime,
			});
			endTime.value = end;
		}
	}

	return {
		startTime: { ...startTime },
		endTime: { ...endTime },
	};
};

export const getOffset = (oldOffset: number, yAxis: INewYAxisItem) => {
	if (checkEnumDataType(yAxis?.yAxisType as string)) {
		return oldOffset + ENUM_YAXIS_OFFSET;
	} else {
		return oldOffset + DEFAULT_YAXIS_OFFSET;
	}
};

export const setOffsetYAxis = (yAxis: INewYAxisItem[]) => {
	let offsetRight = 0;
	let offsetLeft = 0;
	const groupYAxis = groupBy(yAxis, "position");
	const leftYAxis = groupYAxis.left || [];
	const rightYAxis = groupYAxis.right || [];

	const lastLeftYAxisType = leftYAxis.slice(-1)[0]?.yAxisType;
	const lastRightYAxisType = rightYAxis.slice(-1)[0]?.yAxisType;

	leftYAxis.forEach((item, index) => {
		if (index === 0) {
			item.offset = 0;
		} else {
			item.offset = getOffset(offsetLeft, leftYAxis[index - 1]);
			offsetLeft = item.offset;
		}
	});

	rightYAxis.forEach((item, index) => {
		if (index === 0) {
			item.offset = 0;
		} else {
			item.offset = getOffset(offsetRight, rightYAxis[index - 1]);
			offsetRight = item.offset;
		}
	});

	const objLeftYAxis = keyBy(leftYAxis, "yAxisId");
	const objRightYAxis = keyBy(rightYAxis, "yAxisId");

	yAxis.forEach((item: INewYAxisItem) => {
		if (item.position === "left") {
			item.offset = objLeftYAxis[item.yAxisId!].offset;
		} else {
			item.offset = objRightYAxis[item.yAxisId!].offset;
		}
	});

	if (leftYAxis.length === 0) {
		offsetLeft = 40;
	} else {
		offsetLeft +=
			lastLeftYAxisType && checkEnumDataType(lastLeftYAxisType)
				? ENUM_YAXIS_OFFSET
				: DEFAULT_YAXIS_OFFSET;
	}

	if (rightYAxis.length === 0) {
		offsetRight = 40;
	} else {
		offsetRight +=
			lastRightYAxisType && checkEnumDataType(lastRightYAxisType)
				? ENUM_YAXIS_OFFSET
				: DEFAULT_YAXIS_OFFSET;
	}

	return {
		offsetLeft,
		offsetRight,
	};
};

export const getMappedTags = (
	tags: Tags,
	dataChainId: {
		[key: string]: DataTag[];
	}
) => {
	Object.keys(tags).forEach((key: string) => {
		const tag = tags[key];
		const listData: DataTag[] = dataChainId[key];
		const listAvgData = listData.map(i => i.avg);
		const listEnum = uniq(listAvgData);
		const enumTable: EnumTable = {};
		listEnum.forEach(i => {
			enumTable[i] = String(i);
		});

		if (tag.dataType === TAG_DATA_TYPE.DIGITAL) {
			if (!tag.dataProperties?.enumTable) {
				tags[key] = {
					...tags[key],
					dataProperties: {
						...tags[key].dataProperties,
						enumTable: DIGITAL_ENUM_TABLE,
					},
				};
			}
		} else if (tag.dataType === TAG_DATA_TYPE.ENUM) {
			if (!tag.dataProperties?.enumTable) {
				tags[key] = {
					...tags[key],
					dataProperties: {
						...tags[key].dataProperties,
						enumTable,
					},
				};
			}
		}
	});
	return tags;
};

export const mapDisplayData = ({
	tags,
	chainId,
	dataChainId,
	listMapData,
}: {
	tags: Tags;
	chainId: string;
	dataChainId: {
		[key: string]: DataTag[];
	};
	listMapData: {
		displayData: number | null;
		displayDataRes: {
			[key: string]: {
				[key: string]: number;
			};
		} | null;
		isEndPoint: boolean;
	}[];
}) => {
	listMapData.forEach(mapDataItem => {
		if (mapDataItem.displayData && mapDataItem.displayDataRes) {
			Object.keys(dataChainId).forEach(key => {
				const item = dataChainId[key];

				if (!mapDataItem.displayDataRes![chainId]) return;

				const newData = mapDataItem.displayDataRes![chainId][key];

				if (newData === null || newData === undefined) return;

				const index = item.findIndex(i => i.ts === mapDataItem.displayData);

				// If time exists in current data, replace
				if (index !== -1) {
					if (checkEnumDataType(tags[key].dataType)) {
						item[index].avg = newData;
					} else {
						item[index].avg = newData;
						item[index].max = newData;
						item[index].min = newData;
					}
				} else {
					// Add new data if not exists

					let newItem = {
						avg: newData,
						max: newData,
						min: newData,
						ts: mapDataItem.displayData as number,
						count: 1,
					};
					if (checkEnumDataType(tags[key].dataType)) {
						newItem = {
							avg: newData,
							ts: mapDataItem.displayData as number,
						} as DataTag;
					}

					let insertIndex = -1;
					// Find the index to insert newItem
					if (mapDataItem.isEndPoint) {
						// find index to insert end point
						for (let i = item.length - 1; i >= 0; i--) {
							if (newItem.ts > item[i].ts) {
								insertIndex = i + 1;
								break;
							}
						}
						if (insertIndex === -1) {
							insertIndex = 0;
						}
						item.splice(insertIndex, 0, newItem);
					} else {
						// find index to insert start point
						insertIndex = item.findIndex(i => newItem.ts > i.ts);
						if (insertIndex === -1) {
							insertIndex = 0;
						} else {
							insertIndex += 1;
						}

						if (newItem.ts < item[0].ts) {
						}
						// Check insert point is before first point
						item.splice(insertIndex, 0, newItem);
					}
				}

				dataChainId[key] = item;
			});
		}
	});
};

export function changeKey(jsonObject: DataRawTimeseriesResponse): FormattedData {
	const result: FormattedData = {};

	for (const outerKey in jsonObject) {
		result[outerKey] = {};

		for (const innerKey in jsonObject[outerKey]) {
			result[outerKey][innerKey] = jsonObject[outerKey][innerKey].map(item => {
				const { ts, v } = item;
				return { ts, avg: v };
			});
		}
	}

	return result;
}

export function convertArrayToObject(arr: ResponseData[]) {
	const result: ResponseData = {};

	for (const item of arr) {
		const key = Object.keys(item)[0]; // Get the first key in the item object
		const value = item[key]; // Get the corresponding value

		// Merge the value into the result object
		if (result[key]) {
			result[key] = { ...result[key], ...value };
		} else {
			result[key] = value;
		}
	}

	return result;
}
