import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { SpotifyClient } from "../lib/spotify";

interface SpotifyContextValue {
	client: SpotifyClient | null;
	tokenExpired: boolean;
	setToken: (token: string) => void;
}

const SpotifyContext = createContext<SpotifyContextValue | null>(null);

export function SpotifyProvider({ children }: { children: ReactNode }) {
	const [token, setTokenState] = useState<string>(
		() =>
			localStorage.getItem("spotify_token") ??
			import.meta.env.VITE_SPOTIFY_TOKEN ??
			"",
	);
	const [tokenExpired, setTokenExpired] = useState(false);

	const setToken = (t: string) => {
		localStorage.setItem("spotify_token", t);
		setTokenExpired(false);
		setTokenState(t);
	};

	// Patch the client to catch expiry globally
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
				children
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
