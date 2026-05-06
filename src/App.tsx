import { Profile } from "./components/Profile";
import { CurrentlyPlaying } from "./components/CurrentlyPlaying";
import { useEffect } from "react";

export default function App() {
	useEffect(() => {
		fetch("https://api.spotify.com/v1/me", {
			headers: {
				Authorization: `Bearer ${import.meta.env.VITE_SPOTIFY_TOKEN}`,
			},
		})
			.then((r) => r.json())
			.then(console.log)
			.catch(console.error);
	}, []);

	return (
		<div
			style={{
				maxWidth: 600,
				margin: "40px auto",
				fontFamily: "sans-serif",
			}}
		>
			<Profile />
			<hr />
			<CurrentlyPlaying />
		</div>
	);
}
