import * as assert from "assert";
import 'dotenv/config';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", async () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  // Test index and retrieval with mocked vector database
  // First, we need to create the document store with MemoryVectorStore
  // and mocked embedding model
  // Then, we need to create a document manager with the document store
  // Then, we need to add a documentation source to the document manager
  // Then, we need to test finding similar documents
  test("Index and retrieval", async () => {
    const { DocumentationStore } = await import(
      "../../documentationStore.mjs"
    );
    const { DocumentationManager } = await import(
      "../../documentationManager.mjs"
    );
    const docStore = new DocumentationStore("file:///tmp/");
    const docManager = new DocumentationManager(docStore);
    await docManager.addSource(
      "Directory",
      'src/test/suite/testData'
    );
    const similarDocs = await docStore.findSimilarDocuments("Hello world");
    assert.strictEqual(similarDocs.length, 1);
  });
});
