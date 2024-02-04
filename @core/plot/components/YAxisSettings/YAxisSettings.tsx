import {
	Collapse,
	Divider,
	IconButton,
	IconButtonProps,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import type { EChartsOption } from "echarts";
import * as React from "react";
import {
	DEFAULT_MIN_YAXIS,
	DEFAULT_MAX_YAXIS,
	INewYAxisItem,
	DEFAULT_Y_AXIS_POSITION,
} from "../../common/constants";
import ColorPickerSelection from "../../../ColorPicker/Selection/Selection";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/material/styles";
import { MenuItemContent } from "../MenuItemContent/MenuItemContent";
import { checkEnumDataType } from "../../common/utils";

// ** Translation Imports
import { useTranslation } from "react-i18next";

interface ExpandMoreProps extends IconButtonProps {
	expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
	const { expand, ...other } = props;
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? "rotate(0deg)" : "rotate(90deg)",
	marginLeft: "auto",
	transition: theme.transitions.create("transform", {
		duration: theme.transitions.duration.shortest,
	}),
}));

export interface YAxisSettingsProps {
	cbAutoScale?: (data: EChartsOption) => void;
	cbToggleYAxis?: (data: EChartsOption) => void;
	cbChangeColor?: (data: EChartsOption) => void;
	yAxisData: INewYAxisItem;
}

type YAxisPosition = "left" | "right";

export default function YAxisSettings({
	cbAutoScale,
	cbToggleYAxis,
	cbChangeColor,
	yAxisData,
}: YAxisSettingsProps): React.ReactElement {
	const { t } = useTranslation();

	const [yAxisPosition, setYAxisPosition] = React.useState<YAxisPosition>(
		(yAxisData.position as YAxisPosition) || DEFAULT_Y_AXIS_POSITION
	);
	const [isAutoScale, setIsAutoScale] = React.useState((yAxisData as { scale: boolean }).scale);
	const [min, setMin] = React.useState((yAxisData as { min: number }).min || DEFAULT_MIN_YAXIS);
	const [max, setMax] = React.useState((yAxisData as { max: number }).max || DEFAULT_MAX_YAXIS);
	const [expanded, setExpanded] = React.useState<boolean>(false);
	const isEnumType = checkEnumDataType(yAxisData.yAxisType!) || false;

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	const handleToggleYAxis = (_event: React.MouseEvent<HTMLElement>, newPosition: YAxisPosition) => {
		if (!newPosition) return;
		const newOption: EChartsOption = {
			yAxis: {
				position: newPosition,
			},
		};

		setYAxisPosition(newPosition);
		cbToggleYAxis && cbToggleYAxis(newOption);
	};

	const handleSwitchAutoScale = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.checked) {
			setMin(DEFAULT_MIN_YAXIS);
			setMax(DEFAULT_MAX_YAXIS);
		}

		const newOption: EChartsOption = e.target.checked
			? {
					yAxis: {
						scale: true,
						min: undefined,
						max: undefined,
					},
			  }
			: {
					yAxis: {
						scale: false,
						min: DEFAULT_MIN_YAXIS,
						max: DEFAULT_MAX_YAXIS,
					},
			  };
		setIsAutoScale(e.target.checked);
		cbAutoScale && cbAutoScale(newOption);
	};

	const handleChangeMin = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newOption: EChartsOption = {
			yAxis: {
				scale: false,
				min: parseInt(e.target.value),
				max,
			},
		};
		setMin(parseInt(e.target.value));
		cbAutoScale && cbAutoScale(newOption);
	};

	const handleChangeMax = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newOption: EChartsOption = {
			yAxis: {
				scale: false,
				max: parseInt(e.target.value),
				min,
			},
		};
		setMax(parseInt(e.target.value));
		cbAutoScale && cbAutoScale(newOption);
	};

	const handleChangeColor = (color: string) => {
		const newOption: EChartsOption = {
			yAxis: {
				axisLabel: {
					color,
				},
				nameTextStyle: {
					color,
				},
				axisLine: {
					show: true,
					lineStyle: {
						color,
					},
				},
			},
		};
		cbChangeColor && cbChangeColor(newOption);
	};

	return (
		<>
			<Box sx={{ display: "flex", backgroundColor: "#FFFFFF", minHeight: "48px" }}>
				<Divider />
				<MenuItem disableRipple>
					<ColorPickerSelection
						color={yAxisData.axisLabel?.color as string}
						onChange={handleChangeColor}
					/>
					<Box sx={{ cursor: "default" }} ml={1}>
						yAxis: {yAxisData.name}
					</Box>
				</MenuItem>

				<Box sx={{ display: "flex", width: "100%", cursor: "pointer" }} onClick={handleExpandClick}>
					<ExpandMore
						expand={expanded}
						aria-expanded={expanded}
						aria-label="show more"
						sx={{ "&:hover": { backgroundColor: "#FFFFFF" } }}
					>
						<ChevronRightIcon />
					</ExpandMore>
				</Box>
			</Box>

			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<MenuItem disableRipple sx={{ cursor: "default" }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							width: "100%",
							height: "40px",
						}}
					>
						<Typography> {t("echarts.yAxisSettings.placement")}</Typography>
						<FormGroup>
							<ToggleButtonGroup
								value={yAxisPosition}
								exclusive
								onChange={handleToggleYAxis}
								aria-label="toggle-yaxis"
								sx={{ height: "36px" }}
							>
								<ToggleButton
									sx={{ textTransform: "none", width: "70px" }}
									value="left"
									aria-label="left"
								>
									{t("echarts.yAxisSettings.left")}
								</ToggleButton>
								<ToggleButton
									sx={{ textTransform: "none", width: "70px" }}
									value="right"
									aria-label="right"
								>
									{t("echarts.yAxisSettings.right")}
								</ToggleButton>
							</ToggleButtonGroup>
						</FormGroup>
					</Box>
				</MenuItem>
				{!isEnumType && (
					<MenuItem disableRipple sx={{ cursor: "default" }}>
						<MenuItemContent>
							<Typography>{t("echarts.yAxisSettings.autoScale")}</Typography>
							<Switch size="small" checked={isAutoScale} onChange={handleSwitchAutoScale} />
						</MenuItemContent>
					</MenuItem>
				)}

				{!isAutoScale && (
					<MenuItem disableRipple sx={{ cursor: "default" }}>
						<FormGroup sx={{ width: "100%" }}>
							<Box
								sx={{
									minHeight: "52px",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<TextField
									sx={{ margin: "0", height: "38px", width: "136px" }}
									disabled={isAutoScale}
									value={min}
									size="small"
									type="number"
									onChange={handleChangeMin}
									label={t("echarts.yAxisSettings.min")}
								/>

								<TextField
									sx={{ margin: "0", height: "38px", width: "136px" }}
									size="small"
									disabled={isAutoScale}
									value={max}
									type="number"
									onChange={handleChangeMax}
									label={t("echarts.yAxisSettings.max")}
								/>
							</Box>
						</FormGroup>
					</MenuItem>
				)}
			</Collapse>
		</>
	);
}
