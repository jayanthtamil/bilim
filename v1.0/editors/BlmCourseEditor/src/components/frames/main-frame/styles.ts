import { makeStyles, createStyles } from "@material-ui/core/styles";

import fonts from "assets/fonts";

export const useMainStyles = makeStyles(
  () =>
    createStyles({
      "@global": {
        "@font-face": fonts,
        html: {
          height: "100%",
          scrollbarWidth: "thin", //For firefox
          scrollbarColor: "#88a7ec #e8eefd",
          overflowX: "hidden",
        },
        "html body": (props: any) => ({
          //parent html selector added to override styles in template.css in styel package.
          minHeight: "100%",
          paddingBottom: "120px", //For showing part page menus at the bottom of iframe
          fontFamily: '"BlmRoboto", Arial, "Helvetica Neue", Helvetica, sans-serif',
          ...props.body,
          "&.busy-cursor, &.busy-cursor *": {
            cursor: "wait !important",
          },
        }),
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
    name: "BlmMainStyles",
  }
);
