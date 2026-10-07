// Hidden player popups. Add, remove, or edit lines here without touching
// any other file — no other code needs to change.
//
// Key = the player's EA username, all lowercase (case doesn't matter when
// someone clicks their name, this file just needs to be lowercase).
// Value = a list of lines. Every time someone clicks the player's name,
// one line is picked at random and shown before their real stats.
// (A single string still works too if a player only needs one line.)
//
// Lines can pull in the player's real stats with these placeholders:
//   {games} {goals} {assists} {motm} {redCards} {winRate} {rating}
//   {passPct} {shotPct} {tacklePct} {cleanSheets} {goalsPerGame}
// If a stat isn't available for that player, lines using it are skipped.
export const PLAYER_EASTER_EGGS = {
  juzaveiro: [
    "THE GOAT",
    "{goals} goals, {assists} assists. The Ballon d'Or committee is taking notes.",
    "{motm} Man of the Match awards. Cristiano's trophy cabinet is nervous.",
    "Averaging a {rating} rating. Zidane-level elegance, teammates just pass and pray.",
  ],
  lazy_panda94: [
    "USELAISEEEEE",
    "{games} games played. Berbatov energy: never once broke into a sprint.",
    "{tacklePct}% tackle success. Özil-level tracking back.",
    "{goals} goals and {assists} assists in {games} games. Riquelme-style: does it all at walking pace.",
  ],
  "zan-shah": [
    "3197 own goals and counting",
    "{goals} goals for us. Richard Dunne called, he wants his own goal record back.",
    "{shotPct}% shot success. Scores at both ends like Martin Škrtel, mostly the wrong one.",
    "{goalsPerGame} goals per game. The opposition's top scorer.",
  ],
  abood_lajam: [
    "L1 Triangle Merchant",
    "{passPct}% pass success. Jorginho would be proud: sideways, sideways, backwards.",
    "{assists} assists. Ray Wilkins was 'The Crab', this guy's the whole crab family.",
    "{games} games and Busquets still passes forward more often.",
  ],
  theundisputed977: [
    "The blind eagle strikes again… and misses yet again.",
    "{shotPct}% shot success. Torres-at-Chelsea vibes.",
    "Undisputed? A {rating} average rating would like a word.",
    "{goals} goals in {games} games. Darwin Núñez finishing, minus the chaos.",
  ],
  j_kagchelland: [
    "He runs down the wing and his teammates are running back to defend.",
    "{passPct}% pass success. Adama Traoré: 100mph down the wing, cross into row Z.",
    "{assists} assists in {games} games. All pace, no end product.",
    "{winRate}% win rate. Thinks he's Vinícius, plays like he's lost.",
  ],
  rexsullivan: [
    "Anddddd it's another red card for Sullivan.",
    "{redCards} red cards. Sergio Ramos is taking notes.",
    "{tacklePct}% tackle success. Pepe-approved tackling technique.",
    "{redCards} reds in {games} games. Roy Keane thinks he should calm down.",
  ],

  daddyqinkeee: [
    "Daddy's home… but the goals aren't.",
    "{goals} goals, {assists} assists in {games} games. Daddy went out for milk and never came back.",
    "{passPct}% pass success. Plays it safe like Michael Carrick, minus the trophies.",
    "{tacklePct}% tackle success. Gattuso energy, Gattuso end product.",
  ],
  harambae1999: [
    "Gone but never forgotten. Unlike his goals, which never existed.",
    "{goals} goals, {assists} assists in {games} games. Harambe had more impact on the internet.",
    "{tacklePct}% tackle success. Built like Adebayo Akinfenwa, tackles like a museum statue.",
    "{cleanSheets} clean sheets. The zoo's best defender.",
  ],
  pudgypuffles: [
    "{assists} assist(s) in {games} games. Somebody frame it.",
    "{goals} goals. Puffing harder than Diego Costa chasing a referee.",
    "{passPct}% pass success. Soft touch, softer impact.",
    "{games} games in and still waiting for a highlight. Emile Heskey believes in you.",
  ],

  // Add new ones the same way:
  // some_username: ["First line", "Scored {goals} in {games} games", "One more"],
};
