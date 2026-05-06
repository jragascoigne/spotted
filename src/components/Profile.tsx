import { useEffect, useState } from "react";
import { useSpotify } from "../context/SpotifyContext";
import type { SpotifyUser } from "../lib/spotify.types";

export function Profile() {
	const { client } = useSpotify();
	const [user, setUser] = useState<SpotifyUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		client
			?.getMe()
			.then(setUser)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [client]);

	if (loading) return <p>Loading profile...</p>;
	if (!user) return <p>Could not load profile.</p>;

	return (
		<div>
			{user.images[0] && (
				<img
					src={user.images[0].url}
					alt={user.display_name}
					width={80}
					height={80}
					style={{ borderRadius: "50%" }}
				/>
			)}
			<h2>{user.display_name}</h2>
			<p>{user.followers.total} followers</p>
		</div>
	);
}
