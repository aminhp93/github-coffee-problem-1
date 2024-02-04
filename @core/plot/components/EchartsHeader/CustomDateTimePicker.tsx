// ** React Imports
import { FC, useState, ReactNode } from "react";

// ** MUI Imports
import TextField from "@mui/material/TextField";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { nbNO, svSE } from "@mui/x-date-pickers/locales";

// ** Third party Imports
import moment from "moment";

// ** Constants Imports
import { EndTime, StartTime, TimeChangeData, TimeFrame } from "../../common/types";
import { DATE_FORMAT, HOUR_MINUTE_FORMAT } from "../../common/constants";

// ** Components Imports
import RangeShortcutsPanel from "./RangeShortcutsPanel";
import i18next from "i18next";

export interface CustomDateTimePickerProps {
	label: ReactNode;
	listTimeFrame: TimeFrame[];
	objTimeFrame: {
		[key: string]: TimeFrame;
	};
	onChangeTime: (time: TimeChangeData) => void;
	time: StartTime | EndTime;
	timeLabel: ReactNode;
	minDate?: moment.Moment;
	maxDate?: moment.Moment;
}

const CustomDateTimePicker = ({
	label,
	listTimeFrame,
	objTimeFrame,
	onChangeTime,
	time,
	timeLabel,
	minDate,
	maxDate,
}: CustomDateTimePickerProps) => {
	const [open, setOpen] = useState(false);

	const { language } = i18next;
	let localLang = undefined;
	let adapterLocale = undefined;
	if (language === "no") {
		localLang = nbNO.components.MuiLocalizationProvider.defaultProps.localeText;
		adapterLocale = "nb";
	} else if (language === "se") {
		localLang = svSE.components.MuiLocalizationProvider.defaultProps.localeText;
		adapterLocale = "sv";
	}

	return (
		<LocalizationProvider
			dateAdapter={AdapterMoment}
			localeText={localLang}
			adapterLocale={adapterLocale}
		>
			<DateTimePicker
				open={open}
				label={label}
				components={{
					PaperContent: RangeShortcutsPanel as FC,
				}}
				inputFormat={`${DATE_FORMAT} ${HOUR_MINUTE_FORMAT}`}
				PaperProps={{ sx: { display: "flex", flexDirection: "row" } }}
				componentsProps={{
					paperContent: {
						onChangeTime,
						time,
						listTimeFrame,
						timeLabel,
						setOpen,
						minDate,
						maxDate,
					},
				}}
				renderInput={props => {
					if (time.timeFrame && props.inputProps) {
						props.inputProps.value = objTimeFrame[time.timeFrame].label;
					}
					return <TextField {...props} />;
				}}
				views={["year", "month", "day"]}
				closeOnSelect={false}
				onChange={newValue => {
					if (!newValue || !newValue.isValid()) return;
					onChangeTime({
						dateValue: newValue,
					});
				}}
				value={moment(time.value)}
				onOpen={() => {
					setOpen(true);
				}}
				onClose={() => {
					setOpen(false);
				}}
				minDate={minDate ? minDate : undefined}
				maxDate={maxDate ? maxDate : undefined}
			/>
		</LocalizationProvider>
	);
};

export default CustomDateTimePicker;
