import { useEffect, useState } from "react";
import { useSpotify } from "../context/SpotifyContext";
import type { SpotifyUser } from "../lib/spotify.types";
import "./Profile.css";

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
		<div className="profile">
			{user.images[0] && (
				<img
					className="profile__avatar"
					src={user.images[0].url}
					alt={user.display_name}
					width={80}
					height={80}
				/>
			)}
			<div className="profile__info">
				<h2 className="profile__display-name">{user.display_name}</h2>
				<p className="profile__followers">
					{user.followers.total} followers
				</p>
			</div>
		</div>
	);
}
