import type { PlayedTrack, Session, SessionStats } from "./session.types";
import type { CurrentlyPlaying } from "./spotify.types";

const STORAGE_KEY = "spotify_session";
const SESSION_GAP_MS = 30 * 60 * 1000;
const MIN_LISTEN_MS = 5000;

function newSession(): Session {
	return {
		id: crypto.randomUUID(),
		startedAt: Date.now(),
		lastActiveAt: Date.now(),
		tracks: [],
	};
}

function load(): Session | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function save(session: Session) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function computeStats(session: Session): SessionStats {
	const { tracks } = session;

	const uniqueTracks = new Set(tracks.map((t) => t.id)).size;
	const uniqueArtists = new Set(
		tracks.flatMap((t) => t.artists.map((a) => a.id)),
	).size;

	const artistMap = new Map<string, number>();
	for (const track of tracks) {
		for (const artist of track.artists) {
			artistMap.set(artist.name, (artistMap.get(artist.name) ?? 0) + 1);
		}
	}
	const topArtists = [...artistMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([name, count]) => ({ name, count }));

	const trackMap = new Map<
		string,
		{ name: string; artist: string; count: number }
	>();
	for (const track of tracks) {
		const existing = trackMap.get(track.id);
		trackMap.set(track.id, {
			name: track.name,
			artist: track.artists[0]?.name ?? "Unknown",
			count: (existing?.count ?? 0) + 1,
		});
	}
	const topTracks = [...trackMap.values()]
		.sort((a, b) => b.count - a.count)
		.slice(0, 10);

	const genreMap = new Map<string, number>();
	for (const track of tracks) {
		for (const genre of track.genres) {
			genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1);
		}
	}
	const topGenres = [...genreMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([genre, count]) => ({ genre, count }));

	const timeline = tracks.map((t) => ({
		track: t.name,
		artist: t.artists[0]?.name ?? "Unknown",
		startedAt: t.startedAt,
	}));

	return {
		uniqueTracks,
		uniqueArtists,
		topArtists,
		topTracks,
		topGenres,
		timeline,
	};
}

export class SessionTracker {
	private session: Session;
	private currentTrackId: string | null = null;
	private currentTrackStart: number | null = null;
	private committed = new Set<string>(); // track ids already counted in this listen

	constructor() {
		const existing = load();
		const isExpired =
			existing && Date.now() - existing.lastActiveAt > SESSION_GAP_MS;

		this.session = existing && !isExpired ? existing : newSession();

		// Rebuild committed set from saved session so refreshes don't re-add
		for (const t of this.session.tracks) {
			this.committed.add(t.id + ":" + t.startedAt);
		}

		save(this.session);
	}

	clear = () => {
		const fresh = newSession();
		this.session = fresh;
		this.currentTrackId = null;
		this.currentTrackStart = null;
		this.committed = new Set();
		save(this.session);
	};

	update(data: CurrentlyPlaying | null, genres: Map<string, string[]>) {
		if (!data?.is_playing || !data.item) return;

		const { item } = data;
		const now = Date.now();

		if (item.id !== this.currentTrackId) {
			// Check if the previous track met the minimum listen threshold
			if (this.currentTrackId && this.currentTrackStart) {
				const listenedMs = now - this.currentTrackStart;
				const key = `${this.currentTrackId}:${this.currentTrackStart}`;

				if (listenedMs >= MIN_LISTEN_MS && !this.committed.has(key)) {
					// Already pushed to tracks array when track started, just mark committed
					this.committed.add(key);
				} else if (!this.committed.has(key)) {
					// Didn't meet threshold — remove it from tracks
					this.session.tracks = this.session.tracks.filter(
						(t) =>
							!(
								t.id === this.currentTrackId &&
								t.startedAt === this.currentTrackStart
							),
					);
				}
			}

			// Start tracking new track
			this.currentTrackId = item.id;
			this.currentTrackStart = now;

			const key = `${item.id}:${now}`;

			// Check if this is a page refresh re-detecting the same track
			const alreadyTracked = this.session.tracks.some(
				(t) => t.id === item.id && now - t.startedAt < 10000,
			);

			if (!alreadyTracked) {
				this.session.tracks.push({
					id: item.id,
					name: item.name,
					artists: item.artists,
					album: {
						id: item.album.id,
						name: item.album.name,
						image: item.album.images[0]?.url ?? "",
					},
					genres: item.artists.flatMap((a) => genres.get(a.id) ?? []),
					startedAt: now,
				});
			} else {
				// Resuming after refresh — restore tracking state
				const existing = this.session.tracks.find(
					(t) => t.id === item.id && now - t.startedAt < 10000,
				);
				if (existing) {
					this.currentTrackStart = existing.startedAt;
					this.committed.add(`${existing.id}:${existing.startedAt}`);
				}
			}
		}

		this.session.lastActiveAt = now;
		save(this.session);
	}

	getSession() {
		return this.session;
	}

	getStats() {
		return computeStats(this.session);
	}
}
