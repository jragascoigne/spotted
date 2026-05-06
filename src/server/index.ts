import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://127.0.0.1:3000" }));
app.use(express.json());

const CLIENT_ID = "3edf5d9cea0a44058eb0493aaaadfe30";
const CLIENT_SECRET = "a6cd4a051bf945f59b8981be8553d13e";

app.post("/refresh", async (req, res) => {
	const { refresh_token } = req.body;
	if (!refresh_token) {
		res.status(400).json({ error: "Missing refresh_token" });
		return;
	}

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token,
		}),
	});

	const data = await response.json();
	res.json(data);
});

app.listen(3001, "127.0.0.1", () => {
	console.log("Auth server running on http://127.0.0.1:3001");
});
