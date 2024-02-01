import { ChangeKeyMap } from "./types";

export const changeKeyMap: ChangeKeyMap = {
  retry_quiz: { obj: "retry_quiz", key: "checked" },
  retry_quiz_attempts: { obj: "retry_quiz", key: "attempts" },
  retry_quiz_lock: { obj: "retry_quiz", key: "lock_when_success" },
  advanced_option1: {
    obj: "advanced",
    key: "show_as_complete_even_if_no_succeed",
  },
};
