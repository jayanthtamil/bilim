import { makeStyles, createStyles } from "@material-ui/core/styles";

export const usePageContainerStyle = makeStyles(
  () =>
    createStyles({
      root: {
        marginTop: "15px",
      },
    }),
  { name: "PageContainer" }
);
