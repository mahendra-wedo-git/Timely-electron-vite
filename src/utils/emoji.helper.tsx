// plane imports
// import { RANDOM_EMOJI_CODES } from "@plane/constants";
// import { LUCIDE_ICONS_LIST } from "@plane/ui";

import { RANDOM_EMOJI_CODES } from "./emoji";

export const getRandomEmoji = () => RANDOM_EMOJI_CODES[Math.floor(Math.random() * RANDOM_EMOJI_CODES.length)];

// export const getRandomIconName = () => LUCIDE_ICONS_LIST[Math.floor(Math.random() * LUCIDE_ICONS_LIST.length)].name;

export const renderEmoji = (
  emoji: string | { name: string; color: string }
) => {
  if (!emoji) return;

  if (typeof emoji === "object") {
    return (
      <span
        style={{ fontSize: "16px", color: emoji.color }}
        className="material-symbols-rounded"
      >
        {emoji.name}
      </span>
    );
  }

  try {
    // unified hex (may contain multiple codepoints: "1f44d-1f3fd")
    if (emoji.includes("-")) {
      return String.fromCodePoint(
        ...emoji.split("-").map((u) => parseInt(u, isNaN(Number(u)) ? 16 : 10))
      );
    }

    // plain decimal ("128077")
    if (!isNaN(Number(emoji))) {
      return String.fromCodePoint(Number(emoji));
    }

    // single hex ("1f44d")
    const hex = parseInt(emoji, 16);
    if (!isNaN(hex)) {
      return String.fromCodePoint(hex);
    }

    // fallback: actual emoji char
    return emoji;
  } catch {
    return emoji;
  }
};


export const groupReactions: (reactions: any[], key: string) => { [key: string]: any[] } = (
  reactions: any,
  key: string
) => {
  if (!Array.isArray(reactions)) {
    console.error("Expected an array of reactions, but got:", reactions);
    return {};
  }

  const groupedReactions = reactions.reduce(
    (acc: any, reaction: any) => {
      if (!reaction || typeof reaction !== "object" || !Object.prototype.hasOwnProperty.call(reaction, key)) {
        console.warn("Skipping undefined reaction or missing key:", reaction);
        return acc; // Skip undefined reactions or those without the specified key
      }

      if (!acc[reaction[key]]) {
        acc[reaction[key]] = [];
      }
      acc[reaction[key]].push(reaction);
      return acc;
    },
    {} as { [key: string]: any[] }
  );

  return groupedReactions;
};

export const convertHexEmojiToDecimal = (emojiUnified: string): string => {
  if (!emojiUnified) return "";

  return emojiUnified
    .toString()
    .split("-")
    .map((e) => parseInt(e, 16))
    .join("-");
};

export const emojiCodeToUnicode = (emoji: string) => {
  if (!emoji) return "";

  // convert emoji code to unicode
  const uniCodeEmoji = emoji
    .toString()
    .split("-")
    .map((emoji) => parseInt(emoji, 10).toString(16))
    .join("-");

  return uniCodeEmoji;
};
