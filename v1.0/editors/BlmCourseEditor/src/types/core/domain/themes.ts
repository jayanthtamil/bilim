export class Theme {
  id: string;
  name: string;
  url: string;
  allowIntroduction = true;

  constructor(id: string = "", name: string = "", url: string = "", allowIntroduction = true) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.allowIntroduction = allowIntroduction;
  }
}
