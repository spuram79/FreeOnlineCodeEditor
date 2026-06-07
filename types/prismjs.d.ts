declare module "prismjs" {
  export interface Token {
    type: string;
    content?: string | Token | Token[];
    tag?: string;
    classes?: string[];
    attrs?: { [key: string]: string };
    language?: string;
    pattern?: RegExp;
    rest?: string[];
    alias?: string | string[];
  }

  export function highlight(code: string, language?: string | object): string;
  export function highlightElement(element: HTMLElement): void;
  export function tokenize(text: string, grammar: Grammar): Token[][];

  export interface Grammar {
    [key: string]: RegExp | string | Grammar;
    rest?: boolean;
  }
}

declare module "prismjs/components/prism-javascript" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-typescript" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-jsx" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-tsx" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-css" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-python" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-java" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-c" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-cpp" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-sql" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-bash" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-json" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/components/prism-markdown" {
  import * as Prism from "prismjs";
  export = Prism;
}

declare module "prismjs/themes/prism-tomorrow.css" {
  const content: string;
  export default content;
}