export interface SpotifyUser {
	id: string;
	display_name: string;
	email: string;
	followers: { total: number };
	images: { url: string }[];
}

export interface SpotifyTrack {
	id: string;
	name: string;
	duration_ms: number;
	artists: { id: string; name: string }[];
	album: {
		id: string;
		name: string;
		images: { url: string; width: number; height: number }[];
		release_date: string;
	};
}

export interface SpotifyArtist {
	id: string;
	name: string;
	genres: string[];
	popularity: number;
	followers: { total: number };
	images: { url: string }[];
}

export interface SpotifyPlaylist {
	id: string;
	name: string;
	description: string;
	tracks: { total: number };
	images: { url: string }[];
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
	next: string | null;
	previous: string | null;
}

export interface SearchResults {
	tracks?: PaginatedResponse<SpotifyTrack>;
	artists?: PaginatedResponse<SpotifyArtist>;
	playlists?: PaginatedResponse<SpotifyPlaylist>;
}

export interface CurrentlyPlaying {
	is_playing: boolean;
	item: SpotifyTrack | null;
	progress_ms: number | null;
}

export type TimeRange = "short_term" | "medium_term" | "long_term";
export type SearchType = "track" | "artist" | "album" | "playlist";
