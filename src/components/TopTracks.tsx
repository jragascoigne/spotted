// components/TopTracks.tsx
import { useEffect, useState } from "react";
import { useSpotify } from "../hooks/useSpotify";
import type { SpotifyTrack } from "../lib/spotify.types";

export function TopTracks() {
	const spotify = useSpotify();
	const [tracks, setTracks] = useState<SpotifyTrack[]>([]);

	useEffect(() => {
		(spotify as any)
			.getTopTracks("short_term", 10)
			.then((res: { items: SpotifyTrack[] }) => setTracks(res.items))
			.catch(console.error);
	}, []);

	return (
		<ul>
			{tracks.map((track) => (
				<li key={track.id}>
					{track.name} — {track.artists[0].name}
				</li>
			))}
		</ul>
	);
}
