import { useEffect, useState } from "react";
import { useSpotifyContext } from "../context/SpotifyContext";
import type { SpotifyClient } from "../lib/spotify";

type ClientMethod = keyof SpotifyClient;
type MethodArgs<K extends ClientMethod> = SpotifyClient[K] extends (
	...args: infer A
) => unknown
	? A
	: never;
type MethodReturn<K extends ClientMethod> = SpotifyClient[K] extends (
	...args: unknown[]
) => Promise<infer R>
	? R
	: never;

export function useSpotifyQuery<K extends ClientMethod>(
	method: K,
	...args: MethodArgs<K>
) {
	const { client } = useSpotifyContext();
	const [data, setData] = useState<MethodReturn<K> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!client) return;
		setLoading(true);
		(client[method] as Function)(...args)
			.then(setData)
			.catch(setError)
			.finally(() => setLoading(false));
	}, [method, JSON.stringify(args)]);

	return { data, loading, error };
}

// Convenience re-export so components don't need the context directly
export { useSpotifyContext as useSpotify };
