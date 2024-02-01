import { createContext, useContext } from "react";

import { CourseElement } from "types";

export interface Context {
  element?: CourseElement;
}

const QuestionEditorContext = createContext<Context>({});
export const useQuestionEditorCtx = () => useContext(QuestionEditorContext);

export default QuestionEditorContext;
