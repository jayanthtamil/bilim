import { ChangeKeyMap } from "./types";

export const changeKeyMap: ChangeKeyMap = {
  related_to: { obj: "related_to", key: "checked" },
  related_to_value: { obj: "related_to", key: "value" },
  retry_quiz: { obj: "retry_quiz", key: "checked" },
  retry_quiz_attempts: { obj: "retry_quiz", key: "attempts" },
  retry_quiz_lock: { obj: "retry_quiz", key: "lock_when_success" },
  feedback_display: { obj: "feedback", key: "display" },
  proposition_feedback_opt1: { obj: "proposition_feedback", key: "by_question" },
  proposition_feedback_opt2: { obj: "proposition_feedback", key: "global" },
  question_feedback_opt1: { obj: "question_feedback", key: "by_question" },
  question_feedback_opt2: { obj: "question_feedback", key: "global" },
  advanced_opt1: {
    obj: "advanced",
    key: "show_as_complete_even_if_no_succeed",
  },
};
