import { luckyTheme, splineTheme } from "./global_theme";

const FontStyles = () => {
  return (
    <style>
      {`
      ${luckyTheme.fontFace}
      ${splineTheme.fontFace}
      `}
    </style>
  );
};

export default FontStyles;
