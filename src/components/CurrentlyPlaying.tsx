import { useEffect, useState } from "react";
import { useSpotify } from "../context/SpotifyContext";
import type { CurrentlyPlaying } from "../lib/spotify.types";

export function CurrentlyPlaying() {
	const { client } = useSpotify();
	const [data, setData] = useState<CurrentlyPlaying | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!client) return;

		const poll = () => {
			client
				.getCurrentlyPlaying()
				.then(setData)
				.catch(console.error)
				.finally(() => setLoading(false));
		};

		poll();
		const interval = setInterval(poll, 5000); // refresh every 5s
		return () => clearInterval(interval);
	}, [client]);

	if (loading) return <p>Loading...</p>;
	if (!data || !data.is_playing || !data.item)
		return <p>Nothing playing right now.</p>;

	const { item, progress_ms } = data;
	const duration = item.duration_ms;
	const progress = progress_ms ?? 0;
	const percent = Math.round((progress / duration) * 100);

	const fmt = (ms: number) => {
		const s = Math.floor(ms / 1000);
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
	};

	return (
		<div>
			<p>Now playing</p>
			{item.album.images[0] && (
				<img
					src={item.album.images[0].url}
					alt={item.album.name}
					width={360}
					height={360}
				/>
			)}
			<h3>{item.name}</h3>
			<p>{item.artists.map((a) => a.name).join(", ")}</p>
			<p>{item.album.name}</p>
			<div
				style={{
					background: "#eee",
					borderRadius: 4,
					height: 6,
					width: "100%",
				}}
			>
				<div
					style={{
						background: "#08916f",
						width: `${percent}%`,
						height: "100%",
						borderRadius: 4,
					}}
				/>
			</div>
			<p>
				{fmt(progress)} / {fmt(duration)}
			</p>
		</div>
	);
}
