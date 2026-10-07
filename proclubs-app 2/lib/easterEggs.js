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
    "{goals} goals, {assists} assists. Bow down.",
    "{motm} Man of the Match awards. The trophy cabinet needs an extension.",
    "Averaging a {rating} rating. Teammates just pass and pray.",
  ],
  lazy_panda94: [
    "USELAISEEEEE",
    "{games} games played. Effort spotted in about 3 of them.",
    "{tacklePct}% tackle success. Lazy by name, lazy by tracking back.",
    "{goals} goals in {games} games. Panda's had a long nap.",
  ],
  "zan-shah": [
    "3197 own goals and counting",
    "{goals} goals for us. The own goals stopped being counted.",
    "{shotPct}% shot success. Scores at both ends, mostly the wrong one.",
    "{goalsPerGame} goals per game. The opposition's top scorer.",
  ],
  abood_lajam: [
    "L1 Triangle Merchant",
    "{passPct}% pass success. Triangle. Triangle. Triangle. Lost the ball.",
    "{assists} assists from a million sideways passes.",
    "{games} games and has never passed forward once.",
  ],
  theundisputed977: [
    "The blind eagle strikes again… and misses yet again.",
    "{shotPct}% shot success. The blind eagle has landed.",
    "Undisputed? A {rating} average rating would like a word.",
    "{goals} goals in {games} games. The eagle needs glasses.",
  ],
  j_kagchelland: [
    "He runs down the wing and his teammates are running back to defend.",
    "{passPct}% pass success. The corner flag thanks you for the crosses.",
    "{assists} assists in {games} games. Teammates already jogging back.",
    "{winRate}% win rate. The wing is his, the result isn't.",
  ],
  rexsullivan: [
    "Anddddd it's another red card for Sullivan.",
    "{redCards} red cards. The ref has him on speed dial.",
    "{tacklePct}% tackle success. Slide first, ask questions never.",
    "{redCards} reds in {games} games. Disciplinary committee's favourite.",
  ],

  // Add new ones the same way:
  // some_username: ["First line", "Scored {goals} in {games} games", "One more"],
};
