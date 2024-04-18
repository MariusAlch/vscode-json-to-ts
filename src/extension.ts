// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import {
  Uri,
  ExtensionContext,
  commands,
  env,
  ViewColumn,
  window,
} from "vscode";
import JsonToTS from "json-to-ts";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("jsonToTs.fromClipboard", transformFromClipboard)
  );
  context.subscriptions.push(
    commands.registerCommand("jsonToTs.fromSelection", transformFromSelection)
  );
}

function transformFromSelection() {
  const tmpFilePath = path.join(os.tmpdir(), "json-to-ts.ts");
  const tmpFileUri = Uri.file(tmpFilePath);

  getSelectedText()
    .then(validateLength)
    .then(parseJson)
    .then((json) => {
      return JsonToTS(json).reduce((a, b) => `${a}\n\n${b}`);
    })
    .then((interfaces) => {
      fs.writeFileSync(tmpFilePath, interfaces);
    })
    .then(() => {
      commands.executeCommand("vscode.open", tmpFileUri, getViewColumn());
    })
    .catch(handleError);
}

async function transformFromClipboard() {
  const text = await env.clipboard.readText();

  Promise.resolve(text)
    .then(validateLength)
    .then(parseJson)
    .then((json) => JsonToTS(json).reduce((a, b) => `${a}\n\n${b}`))
    .then((interfaces) => {
      pasteToMarker(interfaces);
    })
    .catch(handleError);
}

function handleError(error: Error) {
  window.showErrorMessage(error.message);
}

function parseJson(json: string): Promise<object> {
  const tryEval = (str: any) => eval(`const a = ${str}; a`);

  try {
    return Promise.resolve(JSON.parse(json));
    // eslint-disable-next-line no-empty
  } catch (ignored) {}

  try {
    return Promise.resolve(tryEval(json));
  } catch (error) {
    return Promise.reject(new Error("Selected string is not a valid JSON"));
  }
}

function getViewColumn(): ViewColumn {
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

function pasteToMarker(content: string) {
  const { activeTextEditor } = window;

  return activeTextEditor?.edit((editBuilder) => {
    editBuilder.replace(activeTextEditor.selection, content);
  });
}

function getSelectedText(): Promise<string> {
  const { selection, document } = window.activeTextEditor!;
  return Promise.resolve(document.getText(selection).trim());
}

function validateLength(text: string) {
  if (text.length === 0) {
    return Promise.reject(new Error("Nothing selected"));
  } else {
    return Promise.resolve(text);
  }
}
