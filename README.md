# VSCode CodeRAGent Extension

## Introduction
The CodeRAGent (VS Code Retrieval Assisted Generation) Extension for Visual Studio Code allows developers to integrate custom documentation sources directly into their development environment. By indexing documentation into a local vector store, the extension enhances coding and learning experiences through advanced features like code generation and question answering powered by GPT-3.5/4.
This is only a prototype, and the extension is in the early phase. 

## Features
- **Add Custom Documentation Sources**: Index custom documentation by providing links or PDF files. Links will be crawled, and PDFs will be indexed as-is into the local vector store.
- **Code Generation**: Generate code snippets based on user requests, augmented with context from the most semantically similar documents in the local vector store, using the power of GPT-3.5/4.
- **Answer Questions**: Get answers to your programming questions, enhanced with insights from the local vector store documents, utilizing GPT-3.5/4's advanced language models.
- **Manage Documentation Sources**: Easily manage and delete documentation sources and entries within the local vector store.

## Installation
To install the CodeRAGent Extension, follow these steps:
1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for "CodeRAGent Extension".
4. Click on the Install button.

## Usage
### Configuring the Extension
1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
2. Select `CodeRAGent: Set OpenAI API Key` and hit Enter.
3. Enter your OpenAI API key.
If you don't enter the API key, the extension will ask for it the first time you add a documentation source.

### Adding a Documentation Source
1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
2. Select `CodeRAGent: Add Documentation Source` and hit Enter.
3. Select the type of documentation source you wish to add.
4. Provide a path or URI to the documentation source.

### Generating Code
1. Open the Command Palette.
2. Select `CodeRAGent: Generate Code` and hit Enter.
3. Select the documentation source you wish to use.
4. Enter your request and the extension will provide a code snippet based on the context from your local vector store.

### Answering Questions
1. Open the Command Palette.
2. Select `CodeRAGent: Answer Question` and hit Enter.
3. Select the documentation source you wish to use.
. Ask your programming question and receive an answer that's informed by similar documents in your vector store.

## TODO
- LangChain's recursive web loader doesn't work well with some websites (esp. the ones that have sublinks in URLs that are not directories, for example: https://zig.guide). Need to either fix it or implement a custom web loader. For now it is more reliable to download the website with tools like wget and then add it as a local documentation source.
- Auto-detection of documentation source type based on the context and question.
- Pass documents from more than one source to the context.
- Add current file to the context.
- Support custom LLMs and embeddings.