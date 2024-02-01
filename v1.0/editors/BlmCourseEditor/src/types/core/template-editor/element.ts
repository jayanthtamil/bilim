export class Attributes {
  [key: string]: any;
  removables?: string[];
}

export class ClassAttribute {
  items: string[] = [];
  removables: (string | RegExp)[] = [];
}

export class StyleAttribute {
  [key: string]: any;
  removables: string[] = [];
}

export class BLMElement<P = object, Q = object> {
  id?: string;
  isEditable: boolean = true;
  isDeletable: boolean = false;
  mapping?: string;
  component?: string;
  innerHTML?: string;
  option?: string | null;
  options?: P | null;
  editorOptions?: Q | null;
  attributes?: Attributes;
  classAttr?: ClassAttribute;
  styleAttr?: StyleAttribute;
  isDeactivated?: boolean;
}
