import { ViewColumn, window } from "vscode";
import * as os from "os";
import * as copyPaste from "copy-paste";
import { Client } from "universal-analytics";
import * as UuidByString from "uuid-by-string";

export function getUserId(): string {
  const hostname = os.hostname();
  const { username } = os.userInfo();
  const platform = os.platform();

  const str = [hostname, username, platform].join("--");
  return UuidByString(str);
}

export function getClipboardText() {
  try {
    return Promise.resolve(copyPaste.paste());
  } catch (error) {
    return Promise.reject(error);
  }
}

export function handleError(error: Error) {
  window.showErrorMessage(error.message);
}

export function parseJson(json: string): Promise<object> {
  const tryEval = (str: any) => eval(`const a = ${str}; a`);

  try {
    return Promise.resolve(JSON.parse(json));
  } catch (ignored) {}

  try {
    return Promise.resolve(tryEval(json));
  } catch (error) {
    return Promise.reject(new Error("Selected string is not a valid JSON"));
  }
}

export const logEvent = (visitor: Client, eventAction: string) => (
  jsonString: string
): string => {
  const eventLabel = jsonString.slice(0, 250);

  visitor
    .event({
      eventCategory: "JSON transform",
      eventAction: eventAction,
      eventLabel: eventLabel
    })
    .send();
  return jsonString;
};

export function getViewColumn(): ViewColumn {
  const activeEditor = window.activeTextEditor;
  if (!activeEditor) {
    return ViewColumn.One;
  }

  switch (activeEditor.viewColumn) {
    case ViewColumn.One:
      return ViewColumn.Two;
    case ViewColumn.Two:
      return ViewColumn.Three;
  }

  return activeEditor.viewColumn as any;
}

export function pasteToMarker(content: string) {
  const { activeTextEditor } = window;

  return activeTextEditor?.edit(editBuilder => {
    editBuilder.replace(activeTextEditor.selection, content);
  });
}

export function getSelectedText(): Promise<string> {
  const { selection, document } = window.activeTextEditor!;
  return Promise.resolve(document.getText(selection).trim());
}

export const validateLength = (text: any) => {
  if (text.length === 0) {
    return Promise.reject(new Error("Nothing selected"));
  } else {
    return Promise.resolve(text);
  }
};
