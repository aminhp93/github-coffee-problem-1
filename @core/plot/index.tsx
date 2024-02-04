// ** React Imports
import { memo, RefObject, useCallback, useEffect, useMemo, useState } from "react";

// MUI Imports
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { GridRowModel } from "@mui/x-data-grid-pro";

// ** Echarts Imports
import type {
	DataZoomComponentOption,
	EChartsOption,
	GridComponentOption,
	LineSeriesOption,
} from "echarts";
import { getInstanceByDom } from "echarts";

// ** Third Party Components
import { debounce, get, isEqual, keyBy } from "lodash";
import moment, { DurationInputArg2 } from "moment";
import { useDispatch, useSelector } from "react-redux";

// ** Store Import
import Store from "../../store";
import {
	addDataTag,
	addTag,
	removeDataTag,
	removeTag,
	resetEcharts,
	updateEndTime,
	updateOption,
	updateResolution,
	updateRows,
	updateStartTime,
	updateTags,
} from "../../store/actions/echarts";
import {
	selectDataTags,
	selectEndTime,
	selectOption,
	selectResolution,
	selectResolutionTime,
	selectResolutionValue,
	selectRows,
	selectStartTime,
	selectTags,
} from "../../store/echarts";
import {
	DATAZOOM_OPTION,
	DATE_TIME_FORMAT,
	DEFAULT_OPTION,
	INewYAxisItem,
	MIN_PERCENT_UPDATE_SLIDER,
	NUMBER_CALL_API_INTERVAL,
	DATE_TIME_FORMAT_GET_VALUE,
} from "./common/constants";

// ** Custom Components
import CliComs from "../../Core/lib/CliComs";
import EchartsHeader from "./components/EchartsHeader/EchartsHeader";
import EchartsSettings from "./components/EchartsSettings/EchartsSettings";
import EchartsSettingsTable from "./components/EchartsSettingsTable/EchartsSettingsTable";
import Echarts from "./Echarts";

// ** Constants
import Common from "../../Core/lib/Common";
import Network from "../../Core/lib/Network";
import { tagCheck, getValue } from "./common/service";
import {
	AddedTag,
	Batch,
	EchartsDataZoomParams,
	EchartsHighlightParams,
	ExportImageType,
	ExportType,
	IListItem,
	ResponseData,
	Tag,
	TimeChangeData,
} from "./common/types";
import {
	convertArrayToObject,
	exportImage,
	getGrid,
	getInterval,
	getNewDataZoom,
	getNewRows,
	getRows,
	getStartEndTime,
	getXAxis,
	getYAxisAndSeries,
	useIsFirstRender,
	validateTime,
	getMappedTags,
	mapDisplayData,
	checkEnumDataType,
} from "./common/utils";

type Props = {
	tags?: Tag[];
};

const EchartsPage = (props: Props) => {
	const isFirst = useIsFirstRender();

	const dispatch = useDispatch();
	const option = useSelector(selectOption);
	const tags = useSelector(selectTags);
	const dataTags = useSelector(selectDataTags);
	const rows = useSelector(selectRows);
	const startTime = useSelector(selectStartTime);
	const endTime = useSelector(selectEndTime);
	const resolution = useSelector(selectResolution);

	const [chartRef, setChartRef] = useState<RefObject<HTMLDivElement>>();
	const [loading, setLoading] = useState(false);
	const [showTable, setShowTable] = useState(true);

	const debounceHighlight = useMemo(
		() =>
			debounce((params: EchartsHighlightParams, series: LineSeriesOption[]) => {
				const list: IListItem[] = [];
				const store = Store.getState();
				const updatedTags = selectTags(store);
				const updatedDataTags = selectDataTags(store);

				params.batch.forEach((i: Batch) => {
					const seriesItem: LineSeriesOption = series[i.seriesIndex];
					if (seriesItem) {
						const seriesItemData = seriesItem.data as Array<number>[];
						const value = seriesItemData[i.dataIndex] && seriesItemData[i.dataIndex][1];
						list.push({
							name: seriesItem.name as string,
							value,
						});
					}
				});

				const newRows = getNewRows(Object.values(updatedTags), updatedDataTags, list);

				if (newRows.length) {
					dispatch(updateRows(newRows));
				}
			}, 100),
		[dispatch]
	);

	const handleHighlight = useCallback(
		(params: EchartsHighlightParams, series: LineSeriesOption[]) => {
			debounceHighlight(params, series);
		},
		[debounceHighlight]
	);

	const handleExportCSV = useCallback(() => {
		const store = Store.getState();
		const updatedTags = selectTags(store);
		const updatedDataTags = selectDataTags(store);
		if (Object.keys(updatedTags).length > 0) {
			let csv = "SEP=;\n";
			csv += "Tag Name;Description;Controller name;Timestamp;Average;Min;Max\n";
			let tag: Tag;
			let dateString = "";
			const CommonInstance = Common as {
				readableDateTime?: (data: string) => void;
				localDownload?: (file: string, fileName: string, fileType: string) => void;
			};
			//TODO: Needs optimizing, might even crash the web if someone tries to download history for a plot that's been running for a few hours,
			//due to the massive amount of values. -Hemming
			for (let i = 0; i < Object.keys(updatedTags).length; i++) {
				tag = updatedTags[Object.keys(updatedTags)[i]];
				for (const element of updatedDataTags[tag["uuid"]]) {
					const item = element;
					const date = new Date(item.ts);
					if (CommonInstance && CommonInstance.readableDateTime) {
						dateString =
							date.getFullYear() +
							"-" +
							CommonInstance.readableDateTime((date.getMonth() + 1).toString()) +
							"-" +
							CommonInstance.readableDateTime(date.getDate().toString()) +
							" " +
							CommonInstance.readableDateTime(date.getHours().toString()) +
							":" +
							CommonInstance.readableDateTime(date.getMinutes().toString()) +
							":" +
							CommonInstance.readableDateTime(date.getSeconds().toString());
					}

					const networkList = (
						Network as unknown as {
							nameList: {
								[key: string]: string;
							};
						}
					).nameList;
					//TODO: Need to get tag name from store. -Hemming @anyone
					csv +=
						tag["name"] +
						";" +
						tag["description"] +
						";" +
						networkList[tag["chainId"]] +
						";" +
						dateString +
						";" +
						item.avg +
						";" +
						item.min +
						";" +
						item.max +
						"\n";
				}
			}

			//open download dialog
			CommonInstance &&
				CommonInstance.localDownload &&
				CommonInstance.localDownload(csv, "values.csv", "text/csv;charset=utf-8");
		}
	}, []);

	const handleRemove = useCallback(
		(data: GridRowModel) => {
			// TODOS: currently we have wrong setup for yAxidId. It should be array of list series id.
			// So we need to update it when we remove series - temp solution is reuse all logic when init indexYAxis
			const store = Store.getState();
			const option = selectOption(store);
			const series = [...(option?.series as LineSeriesOption[])];
			const yAxis = [...(option?.yAxis as INewYAxisItem[])];

			let newYAxis = yAxis.filter((i: INewYAxisItem) => {
				const filteredSeries = series.filter(j => j.id === data.id);
				if (filteredSeries.length === 1) {
					// count number of same yAxisIndex
					const count = series.filter(
						j => j.id && j.yAxisIndex === filteredSeries[0].yAxisIndex
					).length;
					if (count === 1) {
						return false;
					}
				}

				return true;
			});

			let newSeries = series.filter(
				(i: LineSeriesOption) =>
					![data.name, `${data.name}_min`, `${data.name}_max`].includes(i.name)
			);

			if (newYAxis.length === 0 || newSeries.length === 0) {
				dispatch(updateOption(DEFAULT_OPTION));
			} else {
				newSeries.forEach((i: LineSeriesOption) => {
					let baseName = i.name as string;
					if (!baseName) return;
					// check if name has _min or _max at the end and remove it
					if (baseName.includes("_min") || baseName.includes("_max")) {
						baseName = baseName.slice(0, -4);
					}
					const index = newSeries.findIndex((j: LineSeriesOption) => j.name === baseName);
					if (index !== -1) {
						const old = yAxis[i.yAxisIndex as number];

						let newYAxisIndex = newYAxis.findIndex(
							j => j.yAxisType === old.yAxisType && j.name === old.name
						);

						const isEnumDataType = checkEnumDataType(old.yAxisType as string);
						if (isEnumDataType) {
							let listEnum: string[] = [];
							listEnum = Object.values(old.yAxisEnum!);
							const listEnumSorted = [...listEnum].sort();
							// Find existing yAxis enum
							newYAxisIndex = yAxis.findIndex(i => {
								const listYAxisEnumSorted = i.yAxisEnum && [...i.yAxisEnum].sort();
								return isEqual(listYAxisEnumSorted, listEnumSorted);
							});
						}

						if (newYAxisIndex !== -1) {
							i.yAxisIndex = newYAxisIndex;
						}
					}
				});
				dispatch(updateOption({ series: newSeries, yAxis: newYAxis }));
			}

			dispatch(removeTag(data.id));
			dispatch(removeDataTag(data.id));
		},
		[dispatch]
	);

	const getData = useCallback(async () => {
		try {
			if (!chartRef?.current) return;
			const store = Store.getState();
			const startTime = selectStartTime(store);
			const endTime = selectEndTime(store);
			const tags = selectTags(store);
			const resolution = selectResolution(store);
			const option = selectOption(store);

			const keysTags = Object.keys(tags);

			if (!isFirst && keysTags.length > 0 && startTime.value && endTime.value) {
				setLoading(true);
				const tagList = Object.values(tags);

				const res: ResponseData[] | null = await tagCheck({
					tags: tagList,
					startTime: startTime.value,
					endTime: endTime.value,
					resolution,
				});

				let startDisplayData: number | null = null;
				let endDisplayData: number | null = null;

				const chart = getInstanceByDom(chartRef.current);
				const chartOption = chart?.getOption() as EChartsOption;
				startDisplayData = get(chartOption, "dataZoom[0].startValue") as number;
				endDisplayData = get(chartOption, "dataZoom[0].endValue") as number;

				let startDisplayDataRes: {
					[key: string]: {
						[key: string]: number;
					};
				} | null = null;

				let endDisplayDataRes: {
					[key: string]: {
						[key: string]: number;
					};
				} | null = null;
				if (startDisplayData) {
					startDisplayDataRes = await getValue(tagList, {
						ts: moment(startDisplayData).format(DATE_TIME_FORMAT_GET_VALUE),
					});
				}

				if (endDisplayData) {
					endDisplayDataRes = await getValue(tagList, {
						ts: moment(endDisplayData).format(DATE_TIME_FORMAT_GET_VALUE),
					});
				}

				// Get start display time from option
				setLoading(false);
				if (!res) return;
				const formattedData = convertArrayToObject(res) as ResponseData;

				if (!formattedData) return;

				const chainId = Object.keys(formattedData)[0];
				const dataChainId = formattedData[chainId];

				if (dataChainId) {
					mapDisplayData({
						tags,
						chainId,
						dataChainId,
						listMapData: [
							{
								displayData: startDisplayData,
								displayDataRes: startDisplayDataRes,
								isEndPoint: false,
							},
							{
								displayData: endDisplayData,
								displayDataRes: endDisplayDataRes,
								isEndPoint: true,
							},
						],
					});

					const listValues = Object.values(dataChainId);
					const interval = getInterval(listValues);

					const mappedTags = getMappedTags(tags, dataChainId);
					if (!isEqual(mappedTags, tags)) {
						dispatch(updateTags(mappedTags));
					}
					const { yAxis, series, offsetRight, offsetLeft } = getYAxisAndSeries({
						option,
						dataChainId,
						tags: mappedTags,
					});

					const grid = getGrid({
						grid: option.grid as GridComponentOption,
						offsetRight,
						offsetLeft,
					});

					if (resolution.isAuto && interval) {
						dispatch(updateResolution({ isAuto: true, value: interval }));
					}

					dispatch(addDataTag(dataChainId));
					dispatch(
						updateOption({
							yAxis,
							series,
							grid,
						})
					);
				}
			}
		} catch {
			setLoading(false);
		}
	}, [chartRef, dispatch, isFirst]);

	const handleUpdateSettings = useCallback(
		(data: EChartsOption) => {
			dispatch(updateOption(data));
		},
		[dispatch]
	);

	const handleAdd = useCallback(
		(data: AddedTag[]) => {
			const mappedData: Tag[] = data.map((i: AddedTag) => {
				return i.tag;
			});

			const keyByTags = keyBy(mappedData, "uuid");

			dispatch(addTag(keyByTags));
		},
		[dispatch]
	);

	const debounceZoom = useMemo(
		() =>
			debounce((params: EchartsDataZoomParams, oldOption: EChartsOption) => {
				// Zoom using toolbox and call api with smaller resolution
				if (get(params, "batch[0].from")) {
					const startValue = get(params, "batch[0].startValue");
					const endValue = get(params, "batch[0].endValue");
					dispatch(
						updateStartTime({
							value: moment(startValue).format(DATE_TIME_FORMAT),
							timeFrame: undefined,
						})
					);
					dispatch(
						updateEndTime({
							value: moment(endValue).format(DATE_TIME_FORMAT),
							timeFrame: undefined,
						})
					);
				} else {
					// Zoom using inside and slider
					let newDataZoom = getNewDataZoom(oldOption?.dataZoom as DataZoomComponentOption[]);
					dispatch(updateOption({ dataZoom: newDataZoom }));

					// Pan previous
					if (
						params.start < MIN_PERCENT_UPDATE_SLIDER ||
						get(params, "batch[0].start") < MIN_PERCENT_UPDATE_SLIDER
					) {
						// Update timeframe to call api
						const store = Store.getState();
						const startTime = selectStartTime(store);
						const resolutionValue = selectResolutionValue(store);
						const resolutionTime = selectResolutionTime(store);

						if (!startTime.value || !resolutionValue || !resolutionTime) return;

						const start = moment(startTime.value)
							.add(-resolutionValue * NUMBER_CALL_API_INTERVAL, resolutionTime as DurationInputArg2)
							.format(DATE_TIME_FORMAT);

						dispatch(
							updateStartTime({
								value: start,
								timeFrame: undefined,
							})
						);
					}

					// Pan next
					if (
						params.end > 100 - MIN_PERCENT_UPDATE_SLIDER ||
						get(params, "batch[0].end") > 100 - MIN_PERCENT_UPDATE_SLIDER
					) {
						// Update timeframe to call api
						const store = Store.getState();
						const startTime = selectStartTime(store);
						const endTime = selectEndTime(store);
						const resolutionValue = selectResolutionValue(store);
						const resolutionTime = selectResolutionTime(store);

						if (!endTime.value || !resolutionValue || !resolutionTime) return;

						const end = moment(endTime.value)
							.add(
								Number(resolutionValue) * NUMBER_CALL_API_INTERVAL,
								resolutionTime as DurationInputArg2
							)
							.format(DATE_TIME_FORMAT);

						dispatch(
							updateStartTime({
								value: startTime.value,
								timeFrame: undefined,
							})
						);
						dispatch(
							updateEndTime({
								value: end,
								timeFrame: undefined,
							})
						);
					}
				}
			}, 300),
		[dispatch]
	);

	const handleZoom = useCallback(
		(params: EchartsDataZoomParams, oldOption: EChartsOption) => {
			debounceZoom(params, oldOption);
		},
		[debounceZoom]
	);

	const handleExportImage = useCallback(
		(type: ExportImageType) => {
			exportImage(chartRef, type);
		},
		[chartRef]
	);

	const handleCbExport = useCallback(
		(type: ExportType) => {
			if (type === "png") {
				setTimeout(() => {
					handleExportImage("png");
				}, 1000);
			} else if (type === "svg") {
				setTimeout(() => {
					handleExportImage("svg");
				}, 1000);
			} else if (type === "csv") {
				handleExportCSV && handleExportCSV();
			}
		},
		[handleExportCSV, handleExportImage]
	);

	const handleCbChartRef = useCallback((data: RefObject<HTMLDivElement>) => {
		setChartRef(data);
	}, []);

	const handleCbRefresh = useCallback(() => {
		const store = Store.getState();
		const startTime = selectStartTime(store);
		const endTime = selectEndTime(store);

		// Update startTime and endTime if startTime has timeFrame
		if (startTime.timeFrame) {
			let updatedStartTime = {
				...startTime,
			};
			let updatedEndTime = {
				...endTime,
			};

			const { start, end } = getStartEndTime({ startTime: updatedStartTime, endTime });
			updatedStartTime.value = start;
			updatedEndTime.value = end;

			dispatch(updateStartTime(updatedStartTime));
			dispatch(updateEndTime(updatedEndTime));
		} else {
			getData();
		}
	}, [dispatch, getData]);

	const handleShowTableData = (show: boolean) => {
		setShowTable(show);
	};

	const handleDisposeChart = useCallback(() => {
		dispatch(resetEcharts());
	}, [dispatch]);

	const handleRemoveAll = useCallback(() => {
		dispatch(resetEcharts());
	}, [dispatch]);

	const handleChangeStartTime = useCallback(
		(data: TimeChangeData) => {
			const store = Store.getState();
			let startTime = selectStartTime(store);
			const endTime = selectEndTime(store);

			const { startTime: updatedStartTime, endTime: updatedEndTime } = validateTime({
				startTime,
				endTime,
				data: { startTime: data },
			});

			dispatch(updateEndTime(updatedEndTime));
			dispatch(updateStartTime(updatedStartTime));
			dispatch(updateOption({ dataZoom: DATAZOOM_OPTION }));
		},
		[dispatch]
	);

	const handleChangeEndTime = useCallback(
		(data: TimeChangeData) => {
			const store = Store.getState();
			const startTime = selectStartTime(store);
			const endTime = selectEndTime(store);

			const { startTime: updatedStartTime, endTime: updatedEndTime } = validateTime({
				startTime,
				endTime,
				data: { endTime: data },
			});

			dispatch(updateStartTime(updatedStartTime));
			dispatch(updateEndTime(updatedEndTime));
			dispatch(updateOption({ dataZoom: DATAZOOM_OPTION }));
		},
		[dispatch]
	);

	const handleChangeResolution = useCallback(
		(data: string) => {
			const updatedData = {
				isAuto: data === "auto" ? true : false,
				value: data === "auto" ? undefined : data,
			};

			dispatch(updateResolution(updatedData));
		},
		[dispatch]
	);

	useEffect(() => {
		const init = () => {
			// logic is imported from PMP/src/Core/lib/Common.js/openTrend
			if (!props.tags) return;
			const tagPromises = props.tags.map((tag: Tag) =>
				CliComs.promiseSend({
					type: "tag_getInfo",
					payload: {
						uuid: tag.uuid,
						chainId: tag.chainId,
					},
				})
			);

			Promise.allSettled(tagPromises).then(results => {
				if (results.some(result => result.status === "rejected")) {
					console.error("Failed to get tag info");
					return;
				}

				const values = results.map(result => (result as unknown as { value: Tag }).value);
				const entireTags = props.tags?.map((t: Tag) => {
					const tag = values.find((v: Tag) => v.uuid === t.uuid);

					return {
						...t,
						...tag,
					};
				});

				const keyByTags = keyBy(entireTags, "uuid");
				dispatch(addTag(keyByTags));
			});
		};
		init();
	}, [dispatch, props]);

	useEffect(() => {
		getData();
	}, [getData, tags, startTime, endTime, option?.dataZoom]);

	useEffect(() => {
		if (resolution.isAuto && resolution.value) return;
		getData();
	}, [getData, resolution]);

	useEffect(() => {
		if (!isFirst) {
			const newRows = getRows({ tags, option, dataTags, checkEnumType: true });
			dispatch(updateRows(newRows));
		}
	}, [tags, dataTags, dispatch, isFirst, option]);

	useEffect(() => {
		const store = Store.getState();
		const startTimeStore = selectStartTime(store);
		const endTimeStore = selectEndTime(store);
		const option = selectOption(store);

		const xAxis = getXAxis({
			option,
			startTime: startTimeStore.value!,
			endTime: endTimeStore.value!,
		});
		dispatch(
			updateOption({
				xAxis,
			})
		);
	}, [startTime, endTime, dispatch]);

	return (
		<Box
			id="EchartsLineCharts"
			position="relative"
			display="flex"
			flexDirection="column"
			height="100%"
			mx={2}
			sx={{
				cursor: loading ? "not-allowed" : "auto",
			}}
		>
			<Box
				sx={{
					display: "flex",
					marginTop: "10px",
					justifyContent: "space-between",
					pointerEvents: loading ? "none" : "auto",
				}}
			>
				<EchartsHeader
					startTime={startTime}
					endTime={endTime}
					resolution={resolution}
					onChangeStartTime={handleChangeStartTime}
					onChangeEndTime={handleChangeEndTime}
					onChangeResolution={handleChangeResolution}
				/>
				<Box sx={{ marginRight: "-10px", marginTop: "2px" }}>
					<EchartsSettings
						option={option}
						rows={rows}
						tags={tags}
						handleRefresh={handleCbRefresh}
						handleExport={handleCbExport}
						handleAdd={handleAdd}
						handleUpdateSettings={handleUpdateSettings}
						handleShowTableData={handleShowTableData}
						handleRemoveAll={handleRemoveAll}
					/>
				</Box>
			</Box>
			<Box sx={{ width: "100%", height: "4px", marginTop: "4px" }}>
				{loading && <LinearProgress />}
			</Box>
			<Box
				sx={{
					flex: 1,
					pointerEvents: loading ? "none" : "auto",
				}}
			>
				<Echarts
					handleCbChartRef={handleCbChartRef}
					option={option}
					handleHighlight={handleHighlight}
					handleZoom={handleZoom}
					handleDisposeChart={handleDisposeChart}
				/>
			</Box>
			<Box
				height="150px"
				sx={{
					marginBottom: "20px",
					display: showTable ? "block" : "none",
					pointerEvents: loading ? "none" : "auto",
				}}
			>
				{showTable && (
					<EchartsSettingsTable
						rows={rows}
						option={option}
						handleRemove={handleRemove}
						handleUpdateSettings={handleUpdateSettings}
					/>
				)}
			</Box>
		</Box>
	);
};

export default memo(EchartsPage);
