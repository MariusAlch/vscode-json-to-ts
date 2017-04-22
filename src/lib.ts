import { ViewColumn, window, Position } from "vscode";
import * as copyPaste from "copy-paste";
import { Client } from "universal-analytics";

export function getClipboardText () {
  try {
    return Promise.resolve(copyPaste.paste());
  } catch (error) {
    return Promise.reject(error)
  }
}

export function handleError(error: Error) {
  window.showErrorMessage(error.message);
}

export function parseJson (json: string): Promise<object> {
  const tryEval = str => eval(`const a = ${str}; a`)
  
  try {
    return Promise.resolve(JSON.parse(json))
  } catch (ignored) {
  }

  try {
    return Promise.resolve(tryEval(json))
  } catch (error) {
    return Promise.reject(new Error('Selected string is not a valid JSON'))
  }
  
}

export const logEvent = (visitor: Client, eventAction: string) => (jsonString: string): string => {
  visitor
    .event({
      ec: "JSON transform",
      ea: eventAction,
      value: jsonString
    }).send()
    
  return jsonString
}

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

	return activeEditor.viewColumn;
}

export function pasteToMarker (content: string) {
  const { activeTextEditor } = window;

  return activeTextEditor.edit((editBuilder) => {
    editBuilder.replace(activeTextEditor.selection, content)
    const {start} = activeTextEditor.selection
  })
}

export function getSelectedText (): Promise<string> {
  const {selection, document} = window.activeTextEditor;
  return Promise.resolve(document.getText(selection).trim());
}

export const validateLength = text => {
  if(text.length === 0) {
    return Promise.reject(new Error('Nothing selected'))
  } else {
    return Promise.resolve(text);
  }
}