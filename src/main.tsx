import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpotifyProvider } from "./context/SpotifyContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SpotifyProvider>
			<App />
		</SpotifyProvider>
	</StrictMode>,
);
