import { useEffect, useState } from "react";
import { useSpotify } from "../context/SpotifyContext";
import type { CurrentlyPlaying } from "../lib/spotify.types";
import "./CurrentlyPlaying.css";

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
		<div className="currently-playing">
			<p className="currently-playing__label">Now playing</p>
			{item.album.images[0] && (
				<img
					className="currently-playing__artwork"
					src={item.album.images[0].url}
					alt={item.album.name}
					width={360}
					height={360}
				/>
			)}
			<h3 className="currently-playing__track-name">{item.name}</h3>
			<p className="currently-playing__artists">
				{item.artists.map((a) => a.name).join(", ")}
			</p>
			<p className="currently-playing__album-name">{item.album.name}</p>
			<div className="currently-playing__progress-bar">
				<div
					className="currently-playing__progress-fill"
					style={{ width: `${percent}%` }}
				/>
			</div>
			<p className="currently-playing__timestamp">
				{fmt(progress)} / {fmt(duration)}
			</p>
		</div>
	);
}
