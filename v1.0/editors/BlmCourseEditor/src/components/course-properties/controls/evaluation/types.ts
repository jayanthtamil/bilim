import { CourseEvaluationProps, KeysOfType } from "types";

type EvaluationKeys = KeysOfType<CourseEvaluationProps, object>;

export interface ChangeKeyMap {
  [key: string]: { obj: EvaluationKeys; key: string };
}

export const changeKeyMap: ChangeKeyMap = {
  proposition_feedback_opt1: { obj: "proposition_feedback", key: "by_question" },
  proposition_feedback_opt2: { obj: "proposition_feedback", key: "global" },
  question_feedback_opt1: { obj: "question_feedback", key: "by_question" },
  question_feedback_opt2: { obj: "question_feedback", key: "global" },
  advanced_opt1: {
    obj: "advanced",
    key: "show_as_complete_even_if_no_succeed",
  },
  advanced_opt2: {
    obj: "advanced",
    key: "all_sub_eval_succeed_for_validate",
  },
};
