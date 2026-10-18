// Design tokens shared by mobile and web. The website mirrors these as CSS variables.
export const darkPalette = {
  bg: "#0C100E",
  s1: "#151B18",
  s2: "#1E2622",
  line: "#2A3430",
  text: "#F2F5EF",
  muted: "#9AA69F",
  acc: "#C8F03C",
  onAcc: "#0C100E",
  accInk: "#C8F03C",
  blu: "#5CC8FF",
  onBlu: "#06263A",
  bluInk: "#5CC8FF",
  hot: "#FF7A45",
  onHot: "#2A0E02",
  hotInk: "#FF8F5E",
} as const;

export type Palette = { [Key in keyof typeof darkPalette]: string };

export const lightPalette: Palette = {
  bg: "#F4F6F0",
  s1: "#FFFFFF",
  s2: "#EBEFE6",
  line: "#DCE2D6",
  text: "#0E1411",
  muted: "#56625B",
  acc: "#C8F03C",
  onAcc: "#0C100E",
  accInk: "#3E5C00",
  blu: "#5CC8FF",
  onBlu: "#06263A",
  bluInk: "#0A6A9E",
  hot: "#FF7A45",
  onHot: "#2A0E02",
  hotInk: "#B8461A",
};

export const fontFamilies = {
  display: "Big Shoulders Display",
  body: "Archivo",
} as const;
