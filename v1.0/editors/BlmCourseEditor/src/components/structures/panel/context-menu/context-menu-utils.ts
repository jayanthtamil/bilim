import { CourseElement, CourseProps, UpdateElementConnectionPost } from "types";
import { ElementType, ContextMenuActions, ConnectionType } from "editor-constants";
import {
  hasChildTemplate,
  hasConnection,
  hasSummary,
  findIndex,
  hasAutoSummary,
  hasAutoSummaryAllowed,
} from "utils";

const {
  AddChapter,
  AddPage,
  AddScreen,
  AddQuestion,
  AddEvaluation,
  AddCustom,
  AddSimpleContent,
  AddSimplePage,
  AddAnnexesFolder,
  EditScreen,
  EditPage,
  EditQuestion,
  EditSimpleContent,
  EditSimplePage,
  EditPartPage,
  CopyFrom,
  DefineFirstConnection,
  DefineSecondConnection,
  DefineRepeatConnection,
  Duplicate,
  MoveTo,
  Rename,
  ResetTemplate,
  Delete,
  ResetMargin,
  Properties,
  ActivateSummary,
  DeactivateSummary,
  DefineSummary,
  DeleteSummary,
  SwitchSummaryScreen,
  SwitchSummaryPage,
  Divider,
} = ContextMenuActions;

const connectItems = [
  Divider,
  DefineFirstConnection,
  DefineSecondConnection,
  DefineRepeatConnection,
];
const addItems = [AddChapter, AddPage, AddScreen, AddQuestion, AddEvaluation, AddCustom];
const editItems = [Divider, Duplicate, Rename, Delete];
const editItems2 = [Divider, Duplicate, Rename, ResetTemplate, Delete];
const simpleItems = [Divider, AddSimpleContent, AddSimplePage];
const ResetMargin1 = [Divider, ResetMargin];

const editItems3 = [Divider, Duplicate, MoveTo];
const editItems4 = [Divider, Rename, Delete];

const editItemScreen1 = [Divider, Duplicate, MoveTo];
const editItemScreen2 = [Divider, Rename, ResetTemplate, Delete];

export const getContextMenuActions = (
  element: CourseElement,
  treeType: ElementType,
  courseProps?: CourseProps
) => {
  const { type, isEvaluation, theme, parent, isSummary, styleSummary } = element;
  const { navigation } = courseProps || {};
  const hasActivateSummary =
    hasAutoSummaryAllowed(element, navigation?.navigationlevel) && !styleSummary;

  if (treeType === ElementType.Starting) {
    if (type === ElementType.Starting) {
      return [AddPage, AddScreen];
    } else if (type === ElementType.Page) {
      return [EditPage, ...connectItems, ...editItems3, ...editItems4];
    } else if (type === ElementType.Screen) {
      return [EditScreen, ...connectItems, ...simpleItems, ...editItemScreen1, ...editItemScreen2];
    } else if (type === ElementType.PartPage) {
      return [EditPartPage, ...connectItems, ...simpleItems, ...ResetMargin1];
    }
  } else if (treeType === ElementType.Structure) {
    if (type === ElementType.Structure) {
      return [
        ...addItems,
        ...(hasActivateSummary ? [Divider, ActivateSummary] : []),
        Divider,
        CopyFrom,
      ];
    } else {
      const summaryItems = [Divider, isSummary ? DeleteSummary : DefineSummary];

      if (type === ElementType.Page) {
        return [EditPage, ...summaryItems, ...editItems3, ...editItems4];
      } else if (type === ElementType.Screen) {
        return [
          EditScreen,
          ...summaryItems,
          ...simpleItems,
          ...editItemScreen1,
          ...editItemScreen2,
        ];
      } else if (
        parent?.type === ElementType.PartPage ? parent.parent?.isSummary : parent?.isSummary
      ) {
        if (type === ElementType.SimpleContent) {
          return [EditSimpleContent, ...summaryItems, ...editItems2];
        } else if (type === ElementType.SimplePage) {
          return [EditSimplePage, ...summaryItems, ...editItems2];
        }
      }
    }
  } else if (treeType === ElementType.Annexes) {
    if (type === ElementType.Annexes) {
      return [AddPage, AddScreen, AddAnnexesFolder];
    }
  }

  if (type === ElementType.Chapter) {
    const chapterItems = [
      ...(hasActivateSummary ? [Divider, ActivateSummary] : []),
      Divider,
      CopyFrom,
      Divider,
      Properties,
      Duplicate,
      Rename,
      Delete,
    ];
    if (isEvaluation && theme && theme.toLowerCase() !== "none") {
      return [AddQuestion, ...chapterItems];
    } else {
      return [...addItems, ...chapterItems];
    }
  } else if (type === ElementType.Page) {
    return [EditPage, ...editItems3, ...editItems4];
  } else if (type === ElementType.Screen) {
    return [EditScreen, ...simpleItems, ...editItemScreen1, ...editItemScreen2];
  } else if (type === ElementType.Question) {
    return [EditQuestion, ...simpleItems, ...editItems2];
  } else if (type === ElementType.PartPage) {
    return [EditPartPage, ...simpleItems, ...ResetMargin1, Duplicate];
  } else if (type === ElementType.Feedback) {
    return [AddSimpleContent];
  } else if (type === ElementType.SimpleContent) {
    return [EditSimpleContent, ...editItems2];
  } else if (type === ElementType.SimplePage) {
    return [EditSimplePage, ...editItems];
  } else if (type === ElementType.Custom) {
    return [Properties, Duplicate, Rename, Delete];
  } else if (type === ElementType.AnnexesFolder) {
    return [AddAnnexesFolder, AddPage, AddScreen, Divider, CopyFrom, Divider, Rename, Delete];
  } else if (type === ElementType.Summary) {
    return [SwitchSummaryScreen, SwitchSummaryPage, DeactivateSummary];
  } else {
    return [];
  }
};

export const hasContextMenuAction = (element: CourseElement, action: ContextMenuActions) => {
  const connections = element.connections || [];

  switch (action) {
    case DefineFirstConnection:
      return findIndex(connections, ConnectionType.First, "value") !== -1;
    case DefineSecondConnection:
      return findIndex(connections, ConnectionType.Second, "value") !== -1;
    case DefineRepeatConnection:
      return findIndex(connections, ConnectionType.Repeat, "value") !== -1;
    default:
      return false;
  }
};

export const getElementTypeByAction = (action: ContextMenuActions) => {
  switch (action) {
    case ContextMenuActions.AddChapter:
      return ElementType.Chapter;
    case ContextMenuActions.AddEvaluation:
      return ElementType.Evaluation;
    case ContextMenuActions.AddScreen:
      return ElementType.Screen;
    case ContextMenuActions.AddPage:
      return ElementType.Page;
    case ContextMenuActions.AddQuestion:
      return ElementType.Question;
    case ContextMenuActions.AddCustom:
      return ElementType.Custom;
    case ContextMenuActions.AddSimpleContent:
      return ElementType.SimpleContent;
    case ContextMenuActions.AddSimplePage:
      return ElementType.SimplePage;
    case ContextMenuActions.AddAnnexesFolder:
      return ElementType.AnnexesFolder;
  }
};

export const getConnectionTypeByAction = (action: ContextMenuActions) => {
  switch (action) {
    case ContextMenuActions.DefineSecondConnection:
      return ConnectionType.Second;
    case ContextMenuActions.DefineFirstConnection:
      return ConnectionType.First;
    case ContextMenuActions.DefineRepeatConnection:
      return ConnectionType.Repeat;
  }
};

export const createConnection = (
  element: CourseElement,
  connectionType: ConnectionType
): UpdateElementConnectionPost | undefined => {
  const connections = element.connections || [];

  if (!hasConnection(connections, connectionType)) {
    return { id: element.id, connections: [connectionType] };
  }
};

export const validateAutoSummary = (element: CourseElement) => {
  if (hasSummary(element)) {
    throw new Error(
      "You cannot reactivate the Auto Summary because you have created a screen or page as summary. Please delete it before reactivating the Auto Summary"
    );
  }
};

export const validateSummary = (
  element: CourseElement,

  courseProps?: CourseProps
) => {
  const { type, isSummary, templateType, parent } = element;
  const { navigation } = courseProps || {};
  const target =
    type === ElementType.Screen
      ? "screen"
      : type === ElementType.Page
      ? "page"
      : type === ElementType.SimpleContent
      ? "simple content"
      : "simple page";

  if (isSummary) {
    if ((type === ElementType.Screen || type === ElementType.SimpleContent) && templateType) {
      throw new Error(
        `You cannot remove the summary tag from a ${target} with a summary template. You should delete the ${target}.`
      );
    } else if (
      (type === ElementType.Screen ||
        type === ElementType.Page ||
        type === ElementType.SimplePage) &&
      hasSummary(element)
    ) {
      const target2 = type === ElementType.Screen ? "simple content/page" : "partpage";

      throw new Error(
        `You cannot remove the summary tag from a ${target} who has summary ${target2}. You should delete all summary ${target2} first.`
      );
    }
  } else {
    if (parent && hasAutoSummary(parent, navigation?.navigationlevel)) {
      throw new Error(
        "There is an Auto Summary. Auto Summary and template summary cannot be mixed. Deactivate the Auto Summary before define this screen/page as summary."
      );
    } else if (
      parent &&
      [ElementType.Structure, ElementType.Chapter].includes(parent.type) &&
      hasSummary(parent)
    ) {
      throw new Error(
        `There is already a summary. Only one summary can be defined in a chapter. Remove the summary before define this screen/page as summary`
      );
    } else if (
      (type === ElementType.Screen || type === ElementType.SimpleContent) &&
      templateType
    ) {
      throw new Error(
        `You cannot define a ${target} as summary if it has already a template assigned. You have to delete this ${target} or choose another one.`
      );
    } else if (
      (type === ElementType.Page || type === ElementType.SimplePage) &&
      hasChildTemplate(element, ElementType.Question)
    ) {
      throw new Error(
        `You cannot define a ${target} as summary if it has a question partpage. You should delete all questions partpage first.`
      );
    }
  }
};
