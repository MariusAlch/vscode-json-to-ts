import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { Uri, ExtensionContext, commands, env } from "vscode";
import JsonToTS from "json-to-ts";
import {
  handleError,
  parseJson,
  pasteToMarker,
  getSelectedText,
  getViewColumn,
  validateLength,
  logEvent,
  getUserId
} from "./lib";
import * as UniversalAnalytics from "universal-analytics";

const UA: UniversalAnalytics = require("universal-analytics");
const visitor = UA("UA-97872528-2", getUserId());

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("jsonToTs.fromSelection", transformFromSelection)
  );
  context.subscriptions.push(
    commands.registerCommand("jsonToTs.fromClipboard", transformFromClipboard)
  );
}

function transformFromSelection() {
  const tmpFilePath = path.join(os.tmpdir(), "json-to-ts.ts");
  const tmpFileUri = Uri.file(tmpFilePath);

  env.clipboard.readText()
    .then(logEvent(visitor, "Selection"))
    .then(validateLength)
    .then(parseJson)
    .then(json => {
      return JsonToTS(json).reduce((a, b) => `${a}\n\n${b}`);
    })
    .then(interfaces => {
      fs.writeFileSync(tmpFilePath, interfaces);
    })
    .then(() => {
      commands.executeCommand("vscode.open", tmpFileUri, getViewColumn());
    })
    .catch(handleError);
}

function transformFromClipboard() {
  getClipboardText()
    .then(logEvent(visitor, "Clipboard"))
    .then(validateLength)
    .then(parseJson)
    .then(json => {
      return JsonToTS(json).reduce((a, b) => `${a}\n\n${b}`);
    })
    .then(interfaces => {
      pasteToMarker(interfaces);
    })
    .catch(handleError);
}
