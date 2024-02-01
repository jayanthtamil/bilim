import { makeStyles, createStyles } from "@material-ui/core/styles";

import fonts from "assets/fonts";

export const useTemplateStyles = makeStyles(
  () =>
    createStyles({
      "@global": {
        "*": {
          boxSizing: "border-box",
          margin: 0,
          padding: 0,
        },
        "@font-face": fonts,
        html: {
          height: "100%",
          scrollbarWidth: "thin", //For firefox
          scrollbarColor: "#88a7ec #e8eefd",
        },
        body: {
          fontFamily: '"BlmRoboto", Arial, "Helvetica Neue", Helvetica, sans-serif',
          minHeight: "100%",
        },
        input: {
          /* Chrome, Safari, Edge, Opera */
          "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
            "-webkit-appearance": "none",
            margin: 0,
          },
          /* Firefox */
          "&[type='number']": {
            "-moz-appearance": "textfield",
          },
        },
      },
    }),
  {
    name: "BlmTemplateStyles",
  }
);
