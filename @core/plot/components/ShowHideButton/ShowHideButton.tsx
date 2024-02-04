import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";

export interface ShowHideButtonProps {
	cb: (data: boolean) => void;
}

export default function ShowHideButton({ cb }: ShowHideButtonProps): React.ReactElement {
	const [checked, setChecked] = useState(true);

	const handleChange = () => {
		if (checked) {
			setChecked(false);
			cb && cb(false);
		} else {
			setChecked(true);
			cb && cb(true);
		}
	};

	return <Checkbox role="showHideBtn" onChange={handleChange} checked={checked} />;
}
