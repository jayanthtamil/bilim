export class Languages {
  primary: Language[] = [];
  others: Language[] = [];
}

export class Language {
  code: string;
  name: string;
  url?: string;

  constructor(code: string, name: string, url?: string) {
    this.code = code;
    this.name = name;
    this.url = url;
  }
}
