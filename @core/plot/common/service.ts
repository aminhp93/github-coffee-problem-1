import History from "../../../Core/lib/History2";
import { ResponseData, TagRequest, Resolution, Tag, DataRawTimeseriesResponse } from "./types";
import { changeKey } from "./utils";

export const tagCheck = async ({
	tags,
	startTime,
	endTime,
	resolution,
}: {
	tags: TagRequest[];
	startTime: string;
	endTime: string;
	resolution?: Resolution;
}): Promise<null | ResponseData[]> => {
	if (!tags || !tags.length || !startTime || !endTime) return Promise.resolve(null);
	const from = new Date(startTime);
	const to = new Date(endTime);
	const dataRequest: {
		from: string;
		to: string;
		timeFormat: string;
		breakpoints: boolean;
		interval?: string;
	} = {
		from: from.toISOString(),
		to: to.toISOString(),
		timeFormat: "epoch",
		breakpoints: false,
	};
	if (resolution && !resolution.isAuto) {
		dataRequest.interval = resolution.value;
	}

	const listEnumAndDigitalTags: TagRequest[] = [];
	const listOtherTags: TagRequest[] = [];
	const listPromise = [];

	tags.forEach(tag => {
		if (tag.dataType === "enum" || tag.dataType === "digital") {
			listEnumAndDigitalTags.push(tag);
		} else {
			listOtherTags.push(tag);
		}
	});

	if (listEnumAndDigitalTags.length > 0) {
		const dataEnumAndDigitalTags = History.getRawTimeseries(listEnumAndDigitalTags, dataRequest);

		const updatedDataPromise = dataEnumAndDigitalTags.then((result: DataRawTimeseriesResponse) =>
			changeKey(result)
		);
		listPromise.push(updatedDataPromise);
	}

	if (listOtherTags.length > 0) {
		listPromise.push(History.getAggregatedTimeseries(listOtherTags, dataRequest));
	}

	return Promise.all(listPromise);
};

export const getValue = (
	tags: Tag[],
	options: {
		ts: string;
	}
) => {
	return History.getValue(tags, options);
};
