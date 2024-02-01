export enum QuestionTemplateTypes {
  Standard = "standard",
  Custom = "custom",
  NoHeader = "no-header",
}

export enum QuestionIntroductionTypes {
  None = "none",
  Media = "media",
  SimpleContent = "simplecontent",
}

export enum QuestionPropositionTypes {
  Single = "single",
  Multiple = "multiple",
}

export enum QuestionPropositionInfoTypes {
  None = "none",
  Simple = "tip",
  Detailed = "simplecontent",
}

export enum QuestionPropositionValidTypes {
  Right = "right",
  Wrong = "wrong",
}

export enum QuestionFeedbackTypes {
  None = "none",
  Propositions = "perpropositions",
  Global = "global",
  Basic = "basic",
  Embedded = "embedded",
  Flap = "flap",
  Detailed = "simplecontent",
}

export enum DetailedFeedbackDisplayTypes {
  Popup = "popup",
  Below = "below",
}
