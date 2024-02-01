//Element Types
export enum ElementType {
  Starting = "starting",
  Structure = "structure",
  Annexes = "annexes",
  Chapter = "chapter",
  Evaluation = "evaluation",
  Screen = "screen",
  Page = "page",
  PartPage = "partpage",
  Question = "question",
  Feedback = "feedback",
  AssociateContent = "associate_content",
  SimplePage = "simple_page",
  SimpleContent = "simple_content",
  SimplePartPage = "simple_partpage",
  Custom = "custom",
  AnnexesFolder = "annexes_folder",
  Summary = "summary",
  Root = "root",
  ResetMargin = "resetmargin",
}

export type StructureTypes = ElementType.Starting | ElementType.Structure | ElementType.Annexes;
export type TemplateTypes =
  | ElementType.PartPage
  | ElementType.Screen
  | ElementType.Question
  | ElementType.SimpleContent
  | ElementType.SimplePartPage;
export type TemplateSopes = TemplateTypes;

//Connection Types
export enum ConnectionType {
  First = "first",
  Second = "second",
  Repeat = "repeat",
}

export enum EvaluationType {
  None = "not_an_evaluation",
  Evaluation = "evaluation",
  Placement = "placement_test",
}

export enum FeedbackDisplayType {
  InPopup = "in_popup",
  BelowPartpage = "below_partpage",
  NextPage = "next_page",
}

export enum EvaluationQuestionValidate {
  OnePerQuestion = "one_per_question",
  OneButtonOfTheEnd = "one_button_of_the_end",
}

export enum NavigationType {
  None = "",
  Style = "style",
  Template = "template",
}

export enum CompletionType {
  None = "",
  ScreenDisplayed = "screen_displayed",
  ScreenUndisplayed = "screen_undisplayed",
  ByAction = "by_action",
}
