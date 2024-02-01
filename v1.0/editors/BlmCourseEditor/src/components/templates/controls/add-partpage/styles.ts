import { makeStyles, createStyles } from "@material-ui/core/styles";

import addIcon from "assets/images/buttons/add-1.png";
import addOverIcon from "assets/images/buttons/add-1-over.png";

export const useAddPartPageStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "relative",
        width: "100%",
        zIndex: 100,
        borderTop: "1px dashed #d6d7d7",
        //BILIM-552: [react] add partpage button unaccessible
        "&:first-child": {
          margin: "0 0 -1px 0",
        },
        "&:last-child": {
          margin: "-1px 0 0  0",
        },
      },
      addBtn: {
        position: "absolute",
        cursor: "pointer",
        top: "-15px",
        left: "calc(50% - 14px)",
        width: "35px",
        height: "36px",
        backgroundImage: `url(${addIcon})`,
        "&:hover": {
          backgroundImage: `url(${addOverIcon})`,
        },
      },
    }),
  { name: "BlmAddPartPage" }
);
