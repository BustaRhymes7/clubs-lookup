export default function manifest() {
  return {
    name: "Clubs Lookup",
    short_name: "Clubs Lookup",
    description: "Live EA Pro Clubs stats, match history, and player breakdowns.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a2b20",
    theme_color: "#0f3d2e",
    icons: [
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
