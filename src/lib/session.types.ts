export interface PlayedTrack {
	id: string;
	name: string;
	artists: { id: string; name: string }[];
	album: { id: string; name: string; image: string };
	genres: string[];
	startedAt: number;
}

export interface Session {
	id: string;
	startedAt: number;
	lastActiveAt: number;
	tracks: PlayedTrack[];
}

export interface SessionStats {
	uniqueTracks: number;
	uniqueArtists: number;
	topArtists: { name: string; count: number }[];
	topTracks: { name: string; artist: string; count: number }[];
	topGenres: { genre: string; count: number }[];
	timeline: { track: string; artist: string; startedAt: number }[];
}
