import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { SpotifyClient } from "../lib/spotify";

interface SpotifyContextValue {
	client: SpotifyClient | null;
	tokenExpired: boolean;
	setToken: (token: string) => void;
}

const SpotifyContext = createContext<SpotifyContextValue | null>(null);

async function refreshAccessToken(): Promise<string | null> {
	const refreshToken =
		localStorage.getItem("spotify_refresh_token") ??
		import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN;

	if (!refreshToken) return null;

	const res = await fetch("http://127.0.0.1:3001/refresh", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refresh_token: refreshToken }),
	});

	const data = await res.json();
	if (data.access_token) {
		localStorage.setItem("spotify_token", data.access_token);
		// Store new refresh token if Spotify rotated it
		if (data.refresh_token) {
			localStorage.setItem("spotify_refresh_token", data.refresh_token);
		}
		return data.access_token;
	}

	return null;
}

export function SpotifyProvider({ children }: { children: ReactNode }) {
	const [token, setTokenState] = useState<string>(
		() =>
			localStorage.getItem("spotify_token") ??
			import.meta.env.VITE_SPOTIFY_TOKEN ??
			"",
	);
	const [tokenExpired, setTokenExpired] = useState(!token);

	const setToken = (t: string) => {
		localStorage.setItem("spotify_token", t);
		setTokenExpired(false);
		setTokenState(t);
	};

	const client = token
		? new Proxy(new SpotifyClient(token), {
				get(target, prop) {
					const orig = target[prop as keyof SpotifyClient];
					if (typeof orig !== "function") return orig;
					return async (...args: unknown[]) => {
						try {
							return await (orig as Function).apply(target, args);
						} catch (err) {
							if (
								err instanceof Error &&
								err.message === "TOKEN_EXPIRED"
							) {
								// Try to refresh automatically
								const newToken = await refreshAccessToken();
								if (newToken) {
									setTokenState(newToken);
									// Retry the original call with new token
									const newClient = new SpotifyClient(
										newToken,
									);
									const newMethod =
										newClient[prop as keyof SpotifyClient];
									return await (newMethod as Function).apply(
										newClient,
										args,
									);
								}
								setTokenExpired(true);
							}
							throw err;
						}
					};
				},
			})
		: null;

	return (
		<SpotifyContext.Provider value={{ client, tokenExpired, setToken }}>
			{tokenExpired ? (
				<TokenExpiredBanner onUpdate={setToken} />
			) : (
				<div key={token}>{children}</div>
			)}
		</SpotifyContext.Provider>
	);
}

function TokenExpiredBanner({ onUpdate }: { onUpdate: (t: string) => void }) {
	const [input, setInput] = useState("");
	return (
		<div style={{ padding: 24 }}>
			<h2>Spotify token expired</h2>
			<p>Paste a new access token to continue:</p>
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Bearer token..."
				style={{ width: 400, marginRight: 8 }}
			/>
			<button onClick={() => onUpdate(input)}>Update</button>
		</div>
	);
}

export function useSpotifyContext() {
	const ctx = useContext(SpotifyContext);
	if (!ctx)
		throw new Error(
			"useSpotifyContext must be used inside SpotifyProvider",
		);
	return ctx;
}

export const useSpotify = useSpotifyContext;
