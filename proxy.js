import React, { useEffect, useState } from "react";
import axios from "axios";

const YourComponent = () => {
	const [data, setData] = useState(null);

	useEffect(() => {
		const apiUrl =
			"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cdogecoin%2Ccardano%2Cbinancecoin%2Clitecoin&vs_currencies=eth%2Ceth%2Ceth%2Ceth%2Ceth";

		axios
			.get(apiUrl)
			.then((response) => {
				setData(response.data);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}, []);

	return <div>{/* Render your data here */}</div>;
};

export default YourComponent;
