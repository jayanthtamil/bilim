import { makeStyles, createStyles } from "@material-ui/core/styles";

export const useQuestionContainerStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "relative",
      },
      controls: {
        position: "absolute",
        zIndex: 100,
      },
    }),
  { name: "QuestionContainer" }
);
