export default function manifest() {
  return {
    name: "Clubs Lookup",
    short_name: "Clubs Lookup",
    description: "Free Pro Clubs stats lookup — search any club, see the full breakdown.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e14",
    theme_color: "#0b0e14",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-512", type: "image/png", sizes: "512x512" },
    ],
  };
}
