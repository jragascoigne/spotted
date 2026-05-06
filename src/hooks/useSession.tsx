import { useEffect, useRef, useState } from "react";
import { useSpotify } from "../context/SpotifyContext";
import { SessionTracker } from "../lib/session";
import type { Session, SessionStats } from "../lib/session.types";

export function useSession(pollMs = 5000) {
	const { client } = useSpotify();
	const tracker = useRef(new SessionTracker());
	const genreCache = useRef(new Map<string, string[]>());
	const [session, setSession] = useState<Session>(
		tracker.current.getSession(),
	);
	const [stats, setStats] = useState<SessionStats>(
		tracker.current.getStats(),
	);

	useEffect(() => {
		if (!client) return;

		const poll = async () => {
			const data = await client.getCurrentlyPlaying().catch(() => null);

			// Fetch genres for any uncached artists
			if (data?.item) {
				for (const artist of data.item.artists) {
					if (!genreCache.current.has(artist.id)) {
						const full = await client
							.getArtist(artist.id)
							.catch(() => null);
						genreCache.current.set(artist.id, full?.genres ?? []);
					}
				}
			}

			tracker.current.update(data, genreCache.current);
			setSession({ ...tracker.current.getSession() });
			setStats(tracker.current.getStats());
		};

		poll();
		const interval = setInterval(poll, pollMs);
		return () => clearInterval(interval);
	}, [client, pollMs]);

	const clear = () => {
		tracker.current.clear();
		setSession({ ...tracker.current.getSession() });
		setStats(tracker.current.getStats());
	};
	return { session, stats, clear };
}
