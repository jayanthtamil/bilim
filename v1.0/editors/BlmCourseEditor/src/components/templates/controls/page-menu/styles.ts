import { makeStyles, createStyles } from "@material-ui/core/styles";

export const usePageMenuStyle = makeStyles(
  () =>
    createStyles({
      backdrop: {
        zIndex: 2300,
        backgroundColor: "rgba(0,0,0,0)",
      },
      pageMenu: {
        zIndex: 2301,
        "& .MuiList-root": {
          width: "251px",
          border: "solid 1px #d6d7d7",
          borderRadius: 4,
          backgroundColor: "#ffffff",
          boxShadow: "4px 5px 7px 0px rgba(0, 0, 0, 0.05)",
        },
        "& .MuiList-padding": {
          padding: "0",
        },
        "& .MuiListItem-root": {
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
          height: "42px",
          justifyContent: "center",
        },
        "& .MuiListItem-root:hover": {
          backgroundColor: "#eef0fb",
        },
      },
    }),
  { name: "BlmPageMenu" }
);
