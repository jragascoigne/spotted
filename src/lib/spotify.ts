import type {
	SpotifyUser,
	SpotifyTrack,
	SpotifyArtist,
	PaginatedResponse,
	SearchResults,
	TimeRange,
	SearchType,
} from "./spotify.types";

const BASE_URL = "https://api.spotify.com/v1";

export class SpotifyClient {
	private token: string;

	constructor(token: string) {
		this.token = token;
	}

	private async fetch<T>(endpoint: string): Promise<T> {
		const res = await fetch(`${BASE_URL}${endpoint}`, {
			headers: { Authorization: `Bearer ${this.token}` },
		});

		if (res.status === 401) throw new Error("TOKEN_EXPIRED");
		if (!res.ok) throw new Error(`Spotify error ${res.status}`);

		return res.json() as Promise<T>;
	}

	getMe = () => this.fetch<SpotifyUser>("/me");

	getTopTracks = (timeRange: TimeRange = "medium_term", limit = 20) =>
		this.fetch<PaginatedResponse<SpotifyTrack>>(
			`/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
		);

	getTopArtists = (timeRange: TimeRange = "medium_term", limit = 20) =>
		this.fetch<PaginatedResponse<SpotifyArtist>>(
			`/me/top/artists?time_range=${timeRange}&limit=${limit}`,
		);

	getRecentlyPlayed = (limit = 20) =>
		this.fetch<PaginatedResponse<SpotifyTrack>>(
			`/me/player/recently-played?limit=${limit}`,
		);

	getTrack = (id: string) => this.fetch<SpotifyTrack>(`/tracks/${id}`);
	getArtist = (id: string) => this.fetch<SpotifyArtist>(`/artists/${id}`);

	search = (query: string, types: SearchType[], limit = 10) =>
		this.fetch<SearchResults>(
			`/search?q=${encodeURIComponent(query)}&type=${types.join(",")}&limit=${limit}`,
		);
}
