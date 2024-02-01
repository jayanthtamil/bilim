import {
  DetailedFeedbackDisplayTypes,
  QuestionFeedbackTypes,
  QuestionIntroductionTypes,
  QuestionPropositionInfoTypes,
  TemplateEditorOptionTypes,
  QuestionPropositionTypes,
  MediaOptionTypes,
  QuestionTemplateTypes,
} from "editor-constants";
import { MediaFile } from "../course";
import {
  BaseComponent,
  QuestionCustomComponent,
  QuestionMediaComponent,
  TextComponent,
} from "./component";

export class QuestionTemplate {
  type = QuestionTemplateTypes.Standard;
  introduction = new QuestionIntroduction();
  main = new QuestionMain();
  feedback = new QuestionFeedback();
  parameters = new QuestionParameters();
}

export class QuestionIntroduction {
  introduction: QuestionIntroductionTypes = QuestionIntroductionTypes.None;
  media = new QuestionIntroMedia();
  simpleContentId: string | undefined;
}

export class QuestionMain {
  title = new TextComponent();
  text = new TextComponent();
  media = new QuestionMediaComponent<LinkMedia>();
  sound = new QuestionMediaComponent();
  simpleContent = new BaseComponent();
  instruction = new TextComponent();
  validate = new QuestionValidate();
  content?: QuestionCustomComponent | QuestionPropositionsComponent;
}

export class QuestionFeedback {
  type: QuestionFeedbackTypes = QuestionFeedbackTypes.None;
  tabType: QuestionFeedbackTypes = QuestionFeedbackTypes.Basic;
  global = new QuestionGlobalFeedback();
  detailed = new QuestionDetailedFeedback();
  disableEmbedded = false;
}

export class QuestionParameters {
  relatedTo?: string;
  weight?: number;
  mandatory = false;
  eliminatory = false;
  useforscoring = true;
  timer?: number;
}

export class QuestionIntroMedia {
  title = new TextComponent();
  text = new TextComponent();
  media = new QuestionMediaComponent();
  sound = new QuestionMediaComponent();
  display = new QuestionIntroMediaDisplay();
}

export class QuestionIntroMediaDisplay {
  button = true;
  timer: { status: boolean; value?: number } = { status: false };
  autoEnd = false;
}

export class QuestionValidate {
  checked = true;
}

export class QuestionPropositionsComponent extends BaseComponent<QuestionPropositions> {}

export class QuestionPropositions {
  isMCQ = false;
  restrictTypeToSingle = false;
  randomize = false;
  maximum = 0;
  minimum = 0;
  items: QuestionProposition[] = [];
}

export class QuestionProposition {
  id = "";
  title = new TextComponent();
  text = new TextComponent();
  validity = new BaseComponent<boolean>();
  media = new QuestionMediaComponent();
  sound = new QuestionMediaComponent();
  info = new BaseComponent<QuestionPropositionInfo>();
  feedback = new QuestionPropositionFeedback();
}

export class QuestionPropositionInfo {
  type: QuestionPropositionInfoTypes = QuestionPropositionInfoTypes.None;
  simple = new QuestionPropositionSimpleInfo();
  simpleContentId: string | undefined = TemplateEditorOptionTypes.None;
}

export class QuestionPropositionSimpleInfo {
  title = new TextComponent();
  text = new TextComponent();
}

export class QuestionPropositionFeedback {
  title = new TextComponent();
  text = new TextComponent();
  media = new QuestionMediaComponent();
  sound = new QuestionMediaComponent();
}

export class QuestionGlobalFeedback {
  right = new QuestionGlobalFeedbackItem();
  wrong = new QuestionGlobalFeedbackItem();
}

export class QuestionGlobalFeedbackItem {
  title = new TextComponent();
  text = new TextComponent();
  media = new QuestionMediaComponent();
  sound = new QuestionMediaComponent();
  simpleContent = new BaseComponent();
}

export class QuestionDetailedFeedback {
  rightId: string = TemplateEditorOptionTypes.None;
  wrongId: string = TemplateEditorOptionTypes.None;
  display: DetailedFeedbackDisplayTypes = DetailedFeedbackDisplayTypes.Popup;
}

export class LinkMedia {
  option: MediaOptionTypes = MediaOptionTypes.None;
  media?: MediaFile | null;
}

export interface QuizIntroductionOptionsJSON {
  intro: QuestionIntroductionTypes;
  simplecontentid: string;
  mediaintronext: {
    button: boolean;
    timer: boolean;
    autoend: boolean;
    timervalue: number;
  };
}

export interface QuizPropositionsOptionsJSON {
  type: QuestionPropositionTypes;
  restrict_type_to_single: boolean;
  randomize: boolean;
  maxprop: number;
  minprop: number;
}

export interface QuizFeedbackOptionsJSON {
  feedbacktype: QuestionFeedbackTypes;
  simplecontent?: {
    simplecontenttrue?: string;
    simplecontentfalse?: string;
    display: DetailedFeedbackDisplayTypes;
  };
}

export interface QuizParametersOptionsJSON {
  relatedto?: string;
  weight?: number;
  mandatory: boolean;
  eliminatory: boolean;
  useforscoring: boolean;
  timer?: number;
}
