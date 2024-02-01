import { QuestionProposition, QuestionTemplate } from "types";
import { getQuestionMedias } from "template-builders";
import { isQuestionCustom, isQuestionPropositions } from "utils";
import * as Types from "./types";

function copyData(data: QuestionTemplate) {
  return { ...data };
}

function copyMain(data: QuestionTemplate) {
  const newData = copyData(data);

  newData.main = { ...data.main };

  return newData;
}

function copyMainContent(data: QuestionTemplate) {
  const newData = copyMain(data);

  if (data.main.content) {
    newData.main.content = {
      ...data.main.content,
    };

    if (newData.main.content.value) {
      newData.main.content.value = { ...newData.main.content.value };
    }
  }

  return newData;
}

function deselectAllProposition(
  items: QuestionProposition[],
  exceptFirst: boolean = false,
  except?: QuestionProposition
) {
  return items.map((item) => {
    if (item.validity.value) {
      if (exceptFirst) {
        exceptFirst = false;
        return item;
      } else if (except && item.id === except.id) {
        return item;
      } else {
        return { ...item, validity: { ...item.validity, value: false } };
      }
    } else {
      return item;
    }
  });
}

function questionReducer(
  state: Types.QuestionEditorState,
  action: Types.QuestionEditorActions
): Types.QuestionEditorState {
  const { data } = state;

  if (action.type === Types.INIT_QUESTION_EDITOR_DATA) {
    const { payload } = action;

    return {
      ...state,
      isEdited: false,
      data: payload,
      oldMedias: getQuestionMedias(payload),
    };
  } else if (data) {
    if (action.type === Types.UPDATE_QUESTION_EDITOR_DATA) {
      return { ...state, isEdited: true, data: action.payload };
    } else {
      let newData: QuestionTemplate | undefined;

      if (action.type === Types.UPDATE_QUESTION_INTRODUCTION_DATA) {
        newData = copyData(data);
        newData.introduction = action.payload;
      } else if (action.type === Types.UPDATE_QUESTION_MAIN_DATA) {
        newData = copyData(data);
        newData.main = action.payload;
      } else if (action.type === Types.UPDATE_QUESTION_PROPOSITIONS_DATA) {
        const newPropositions = action.payload;
        newData = copyMainContent(data);

        if (isQuestionPropositions(newData.main.content)) {
          const {
            main: { content: propositions },
          } = newData;

          if (propositions?.value) {
            const { isMCQ } = propositions.value;

            if (!newPropositions.isMCQ && isMCQ !== newPropositions.isMCQ) {
              newPropositions.items = deselectAllProposition(newPropositions.items, true);
            }
          }

          propositions.value = newPropositions;
        }
      } else if (action.type === Types.ADD_QUESTION_PROPOSITION_DATA) {
        newData = copyMainContent(data);

        if (isQuestionPropositions(newData.main.content)) {
          const proposition = action.payload;
          const {
            main: {
              content: { value: propositions },
            },
          } = newData;

          if (propositions) {
            propositions.items = [...propositions.items, proposition];
          }
        }
      } else if (action.type === Types.UPDATE_QUESTION_PROPOSITION_DATA) {
        newData = copyMainContent(data);

        if (isQuestionPropositions(newData.main.content)) {
          const proposition = action.payload;
          const {
            validity: { value: newValidty },
          } = proposition;
          const {
            main: {
              content: { value: propositions },
            },
          } = newData;

          if (propositions) {
            const { isMCQ, items } = propositions;
            let deselectPrevSelected = false;

            const newItems = items.map((item) => {
              if (item.id === proposition.id) {
                if (!isMCQ && newValidty && item.validity.value !== newValidty) {
                  deselectPrevSelected = true;
                }
                return proposition;
              } else {
                return item;
              }
            });

            if (deselectPrevSelected) {
              propositions.items = deselectAllProposition(newItems, false, proposition);
            } else {
              propositions.items = newItems;
            }
          }
        }
      } else if (action.type === Types.DELETE_QUESTION_PROPOSITION_DATA) {
        newData = copyMainContent(data);

        if (isQuestionPropositions(newData.main.content)) {
          const proposition = action.payload;
          const {
            main: {
              content: { value: propositions },
            },
          } = newData;

          if (propositions) {
            propositions.items = propositions.items.filter((item) => item.id !== proposition.id);
          }
        }
      } else if (action.type === Types.UPDATE_QUESTION_CUSTOM_DATA) {
        newData = copyMainContent(data);

        if (isQuestionCustom(data.main.content)) {
          newData.main.content = action.payload;
        }
      } else if (action.type === Types.UPDATE_QUESTION_FEEDBACK_DATA) {
        newData = copyData(data);
        newData.feedback = action.payload;
      } else if (action.type === Types.UPDATE_QUESTION_PARAMETERS_DATA) {
        newData = copyData(data);
        newData.parameters = action.payload;
      }

      if (newData) {
        return { ...state, isEdited: true, data: newData };
      }
    }
  }

  return state;
}

export default questionReducer;
