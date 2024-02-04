// ** React Imports
import { FC, Fragment, useCallback, SetStateAction, Dispatch } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { makeStyles } from "tss-react/mui";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

// ** Third party Imports
import moment from "moment";

// ** Constants Imports
import { HOUR_MINUTE_FORMAT } from "../../common/constants";
import { EndTime, StartTime, TimeChangeData, TimeFrame } from "../../common/types";

const useStyles = makeStyles()(theme => {
	return {
		rangeShortcutsPanel: {
			"& .MuiListItemButton-root": {
				paddingTop: "4px",
				paddingBottom: "4px",
			},
			"& .MuiSelect-select": {
				padding: "10px 32px 10px 10px",
			},
			"& .MuiOutlinedInput-input": {
				padding: "7px 0 7px 10px",
			},
		},
	};
});

export interface RangeShortcutsPanelProps {
	time: StartTime | EndTime;
	children?: FC;
	onChangeTime: (data: TimeChangeData) => void;
	listTimeFrame: TimeFrame[];
	timeLabel: string;
	setOpen: Dispatch<SetStateAction<boolean>>;
	minDate?: moment.Moment;
	maxDate?: moment.Moment;
}

const RangeShortcutsPanel = ({
	time,
	children,
	onChangeTime,
	listTimeFrame,
	timeLabel,
	setOpen,
	minDate,
	maxDate,
}: RangeShortcutsPanelProps) => {
	const { classes } = useStyles();

	const handleChangeTime = useCallback(
		data => {
			onChangeTime({
				timeFrame: data,
			});
			setOpen(false);
		},
		[onChangeTime, setOpen]
	);

	return (
		<Fragment>
			<Box
				sx={{ height: "430px", overflow: "auto" }}
				display="flex"
				className={classes.rangeShortcutsPanel}
			>
				<List>
					{listTimeFrame.map(({ value, label }) => {
						return (
							<ListItem key={value} disablePadding>
								<ListItemButton onClick={() => handleChangeTime(value)}>
									<ListItemText primary={label} />
								</ListItemButton>
							</ListItem>
						);
					})}
				</List>
				<Box
					sx={{
						position: "absolute",
						bottom: "15px",
						right: "30px",
						width: "120px",
						display: "flex",
						justifyContent: "flex-end",
					}}
				>
					<LocalizationProvider dateAdapter={AdapterMoment}>
						<TimePicker
							label={timeLabel}
							inputFormat={HOUR_MINUTE_FORMAT}
							value={moment(time.value)}
							views={["hours", "minutes"]}
							onChange={newValue => {
								if (!newValue || !newValue.isValid()) return;
								onChangeTime({
									timeValue: newValue,
								});
							}}
							renderInput={params => <TextField {...params} />}
						/>
					</LocalizationProvider>
				</Box>
			</Box>
			{children}
		</Fragment>
	);
};

export default RangeShortcutsPanel;
