import { ViewColumn, window, Position } from "vscode";
import * as copyPaste from "copy-paste";

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
  try {
    return Promise.resolve(JSON.parse(json))
  } catch (error) {
    return Promise.reject(new Error('Selected string is not a valid JSON'))
  }
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

  return window.activeTextEditor.edit((editBuilder) => {
    const startLine = window.activeTextEditor.selection.start.line;
    const lastCharIndex = window.activeTextEditor.document.lineAt(startLine).text.length;
    const position = new Position(startLine, lastCharIndex);

    editBuilder.insert(position, content);
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