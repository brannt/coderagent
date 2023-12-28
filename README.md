# VSCode CodeRAGent Extension

## Introduction
The CodeRAGent (VS Code Retrieval Assisted Generation) Extension for Visual Studio Code allows developers to integrate custom documentation sources directly into their development environment. By indexing documentation into a local vector store, the extension enhances coding and learning experiences through advanced features like code generation and question answering powered by GPT-3.5/4.
This is only a prototype, and the extension is in the early phase. For now you can use it in the following way:
1. Download the documentation of tyour choice in HTML format to a directory; making sure that all the files have `.html` extension.
2. Add the directory as a documentation source to the extension.
3. Generate code snippets based on your requests, augmented with context from the most semantically similar documents in the local vector store, using the power of GPT-3.5/4.

## Features
- **Add Custom Documentation Sources**: Index custom documentation by providing links or PDF files. Links will be crawled, and PDFs will be indexed as-is into the local vector store (note: WIP).
- **Code Generation**: Generate code snippets based on user requests, augmented with context from the most semantically similar documents in the local vector store, using the power of GPT-3.5/4.
- **Answer Questions**: Get answers to your programming questions, enhanced with insights from the local vector store documents, utilizing GPT-3.5/4's advanced language models.
- **Manage Documentation Sources**: Easily manage and delete documentation sources and entries within the local vector store (note: WIP).

## Installation
To install the CodeRAGent Extension, follow these steps:
1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for "CodeRAGent Extension".
4. Click on the Install button.

## Usage
### Adding a Documentation Source
1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
2. Type `Add Documentation Source` and hit Enter.
3. Select the type of documentation source you wish to add (only "Directory" is supported, WIP: support PDF and website).
4. Provide a directory path to the downloaded documentation in HTML files. WIP: Provide the link or select the PDF file you wish to index

### Generating Code
1. Open the Command Palette.
2. Type `Generate Code` and hit Enter.
3. Enter your request and the extension will provide a code snippet based on the context from your local vector store.

### Answering Questions
1. Open the Command Palette.
2. Type `Answer Question` and hit Enter.
3. Ask your programming question and receive an answer that's informed by similar documents in your vector store.

## Support
For support, questions, or to report an issue, please visit the [GitHub repository](https://github.com/brannt/coderagent) or contact the support team through the Visual Studio Code Marketplace.

Thank you for using the CodeRAGent Extension!