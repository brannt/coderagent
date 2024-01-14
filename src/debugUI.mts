import { Document } from "langchain/document";
import { createRequire } from "module";
import { DocumentationStore } from "./documentationStore.mjs";
import { DirectorySource } from "./sources/directory.mjs";

const require = createRequire(import.meta.url);

import vscode = require("vscode");

export function showDebugUI(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "debugUI",
    "Debug UI",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );
  panel.webview.html = getWebviewContent();
  const docStore = new DocumentationStore(context.globalStorageUri.fsPath);
  docStore.load();
  panel.webview.onDidReceiveMessage(
    async (message) => {

      let result = "";
      let progressMessage = "";
      let progressFunction = async () => {};
      let progressOptions = {
        location: vscode.ProgressLocation.Notification,
        cancellable: false,
      };

      switch (message.command) {
        case "runSplitter":
          progressMessage = `Running splitter with language ${message.language} and chunk size ${message.chunkSize} and chunk overlap ${message.chunkOverlap}`;
          progressFunction = async () => {
            const docs = await runSplitter(message);
            result = docs.map((doc) => doc.pageContent).join("\n");
            context.workspaceState.update("docs", docs);
          };
          break;

        case "runRetrieval":
          progressMessage = `Running retrieval with search type ${message.searchType} and k value ${message.kValue} and fetch k ${message.fetchK} and query ${message.query}`;
          progressFunction = async () => {
            const retrieverParams = {
              k: message.kValue,
              searchType: message.searchType,
              fetchK: message.fetchK,
            };
            docStore.retrieverParams = retrieverParams;
            const retriever = docStore.getRetriever();
            const resultDocs = await retriever.getRelevantDocuments(
              message.query
            );
            result = resultDocs.map((doc) => doc.pageContent).join("\n");
          };
          break;

        case "reindex":
          progressMessage = "Reindexing documentation sources";
          progressFunction = async () => {
            const docs = context.workspaceState.get("docs");
            if (!docs) {
              vscode.window.showErrorMessage("No documents loaded");
              return;
            }
            await docStore.addDocuments(
              docs as Document<Record<string, any>>[]
            );
            await docStore.save();
            result = "Reindexing finished...";
          };
          break;

        default:
          return;
      }
      await vscode.window.withProgress(
        { title: progressMessage, ...progressOptions },
        async (progress) => {
          await progressFunction();
        }
      );
      panel.webview.postMessage({ command: "showResult", result });
    },
    undefined,
    context.subscriptions
  );
}
async function runSplitter(message: any) {
  const source = new DirectorySource();
  source.splitterParams.chunkSize = message.chunkSize;
  source.splitterParams.chunkOverlap = message.chunkOverlap;
  const docs = await source.load(message.directory);
  return docs;
}

function getWebviewContent() {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug UI</title>
    <script>
    const vscode = acquireVsCodeApi();
    
    function runSplitter() {
        const language = document.getElementById('language').value;
        const chunkSize = parseInt(document.getElementById('chunk-size').value);
        const chunkOverlap = parseInt(document.getElementById('chunk-overlap').value);
        const directory = document.getElementById('directory').value;
        vscode.postMessage({
            command: 'runSplitter',
            language: language,
            chunkSize: chunkSize,
            chunkOverlap: chunkOverlap,
            directory: directory
        });
    }

    function runRetrieval() {
        const searchType = document.getElementById('search-type').value;
        const kValue = document.getElementById('k-value').value;
        const fetchK = document.getElementById('fetch-k').value;
        const query = document.getElementById('query').value;
        vscode.postMessage({
            command: 'runRetrieval',
            searchType: searchType,
            kValue: kValue,
            fetchK: fetchK,
            query: query
        });
    }

    function reindex() {
        vscode.postMessage({
            command: 'reindex'
        });
    }

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'showResult':
                const result = document.getElementById('results');
                result.value = message.result;
                break;
        }
    });
    </script>
    </head>
    <body>
    <div>
        <h2>Splitter</h2>
        <label for="directory">Directory</label>
        <input type="text" id="directory" value="">
        <label for="language">Language</label>
        <input type="text" id="language" value="html">
        <label for="chunk-size">Chunk size</label>
        <input type="number" id="chunk-size" value="500">
        <label for="chunk-overlap">Chunk overlap</label>
        <input type="number" id="chunk-overlap" value="100">
        <button id='run-splitter' onclick="runSplitter()" disable>Run</button>
    </div>

    <div>
        <h2>Retrieval</h2>
        <label for="search-type">Search type</label>
        <select id="search-type">
            <option value="similarity">similarity</option>
            <option value="mmr">mmr</option>
        </select>
        <label for="k-value">K</label>
        <input type="number" id="k-value" value="5">
        <label for="fetch-k">Fetch K</label>
        <input type="number" id="fetch-k" value="5">
        <label for="query">Query</label>
        <input type="text" id="query" value = "How to create a basic modal app">
        <button onclick="runRetrieval()">Run</button>
        <button onclick="reindex()">Reindex</button>
    </div>
    <div>
        <h2>Results...</h2>
        <textarea id="results" rows="10" cols="50" readonly></textarea>
    </div>

    </body>
    </html>`;
}
