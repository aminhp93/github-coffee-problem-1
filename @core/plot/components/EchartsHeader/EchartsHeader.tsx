// ** React Imports
import { memo } from "react";

// ** MUI Imports
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { makeStyles } from "tss-react/mui";

// ** Constants Imports
import {
	LIST_END_TIME_FRAME,
	LIST_RESOLUTION,
	LIST_START_TIME_FRAME,
	OBJ_END_TIME_FRAME,
	OBJ_START_TIME_FRAME,
} from "../../common/constants";
import { EndTime, Resolution, StartTime, TimeChangeData } from "../../common/types";

// ** Components Imports
import CustomDateTimePicker from "./CustomDateTimePicker";

// ** Translation Imports
import { useTranslation } from "react-i18next";
import moment from "moment";

const useStyles = makeStyles()(theme => {
	return {
		root: {
			"& .MuiSelect-select": {
				padding: "10px 32px 10px 10px",
			},
			"& .MuiOutlinedInput-input": {
				padding: "7px 0 7px 10px",
			},
		},
	};
});

export interface EchartsHeaderProps {
	startTime: StartTime;
	endTime: EndTime;
	resolution: Resolution;
	onChangeStartTime: (data: TimeChangeData) => void;
	onChangeEndTime: (data: TimeChangeData) => void;
	onChangeResolution: (data: string) => void;
}

function EchartsLineChartHeader({
	startTime,
	endTime,
	resolution,
	onChangeStartTime,
	onChangeEndTime,
	onChangeResolution,
}: EchartsHeaderProps): React.ReactElement {
	const { classes } = useStyles();
	const { t } = useTranslation();

	const labelResolution = resolution.isAuto
		? `${t("echarts.echartsHeader.auto")} ${resolution.value ? "(" + resolution.value + ")" : ""}`
		: resolution.value;
	return (
		<>
			<Box display="flex" justifyContent="space-between" className={classes.root}>
				<Box display="flex">
					<Box>
						<CustomDateTimePicker
							label={t("echarts.echartsHeader.from")}
							timeLabel={t("echarts.echartsHeader.startTime")}
							objTimeFrame={OBJ_START_TIME_FRAME}
							listTimeFrame={LIST_START_TIME_FRAME}
							onChangeTime={onChangeStartTime}
							time={startTime}
							maxDate={moment(endTime.value)}
						/>
					</Box>
					{!startTime.timeFrame && (
						<Box ml={1}>
							<CustomDateTimePicker
								label={t("echarts.echartsHeader.to")}
								timeLabel={t("echarts.echartsHeader.endTime")}
								listTimeFrame={LIST_END_TIME_FRAME}
								objTimeFrame={OBJ_END_TIME_FRAME}
								onChangeTime={onChangeEndTime}
								time={endTime}
								minDate={moment(startTime.value)}
							/>
						</Box>
					)}
				</Box>
				<Box ml={1}>
					<FormControl fullWidth sx={{ minWidth: "85px" }}>
						<InputLabel id="resolution-select-label">
							{t("echarts.echartsHeader.resolution")}
						</InputLabel>
						<Select
							labelId="resolution-select-label"
							sx={{ minWidth: 100 }}
							id="resolution-select"
							IconComponent={KeyboardArrowDownIcon}
							value={resolution.isAuto ? "auto" : resolution.value}
							label="Resolution"
							onChange={event => {
								onChangeResolution(event.target.value);
							}}
							renderValue={() => {
								return <Box sx={{ display: "flex" }}>{labelResolution}</Box>;
							}}
						>
							{LIST_RESOLUTION.map(i => {
								return (
									<MenuItem key={i.value} value={i.value}>
										{i.label}
									</MenuItem>
								);
							})}
						</Select>
					</FormControl>
				</Box>
			</Box>
		</>
	);
}

export default memo(EchartsLineChartHeader);
