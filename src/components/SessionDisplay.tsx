import { useSession } from "../hooks/useSession";

const time = (ts: number) =>
	new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function SessionDisplay() {
	const { session, stats, clear } = useSession();

	return (
		<div>
			<h2>Current Session</h2>
			<button onClick={clear}>Clear session</button>
			<p>Started: {time(session.startedAt)}</p>
			<p>Tracks played: {stats.uniqueTracks}</p>
			<p>Unique artists: {stats.uniqueArtists}</p>

			<h3>Top Artists</h3>
			<ul>
				{stats.topArtists.map((a) => (
					<li key={a.name}>
						{a.name} — {a.count} {a.count === 1 ? "play" : "plays"}
					</li>
				))}
			</ul>

			<h3>Top Tracks</h3>
			<ul>
				{stats.topTracks.map((t) => (
					<li key={t.name}>
						{t.name} — {t.artist} — {t.count}{" "}
						{t.count === 1 ? "play" : "plays"}
					</li>
				))}
			</ul>

			<h3>Top Genres</h3>
			<ul>
				{stats.topGenres.map((g) => (
					<li key={g.genre}>
						{g.genre} — {g.count} {g.count === 1 ? "play" : "plays"}
					</li>
				))}
			</ul>

			<h3>Timeline</h3>
			<ul>
				{[...stats.timeline].reverse().map((t, i) => (
					<li key={i}>
						{time(t.startedAt)} — {t.track} by {t.artist}
					</li>
				))}
			</ul>
		</div>
	);
}
