import { Box, FormGroup } from "@mui/material";

interface PropsMenuItemContent {
	children: JSX.Element | JSX.Element[];
}

export const MenuItemContent = ({ children }: PropsMenuItemContent) => {
	return (
		<FormGroup sx={{ width: "100%" }}>
			<Box
				sx={{
					width: "100%",
					minHeight: "40px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				{children}
			</Box>
		</FormGroup>
	);
};
