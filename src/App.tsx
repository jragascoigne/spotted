import { useSpotifyQuery } from "./hooks/useSpotify";

export function TopTracks() {
	const { data, loading, error } = useSpotifyQuery(
		"getTopTracks",
		"short_term",
		10,
	);
	const tracks =
		(data && typeof data === "object" && "items" in data
			? (
					data as {
						items?: {
							id: string;
							name: string;
							artists: { name: string }[];
						}[];
					}
				).items
			: []) ?? [];

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

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
