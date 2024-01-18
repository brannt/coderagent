import { ActionFunction, MetaFunction, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import React from "react";
import { query, reindex, runRetrieval, runSplitter } from "~/debug.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  console.log(formData);
  switch (actionType) {
    case "runSplitter":
      return runSplitter(
        formData.get("source") as unknown as string,
        formData.get("chunk-size") as unknown as number,
        formData.get("chunk-overlap") as unknown as number,
        formData.get("path") as unknown as string
      );
    case "reindex":
      return reindex(
        formData.get("source") as unknown as string,
        formData.get("chunk-size") as unknown as number,
        formData.get("chunk-overlap") as unknown as number,
        formData.get("path") as unknown as string,
        formData.get("embedding") as unknown as string
      );
    case "runRetrieval":
      return runRetrieval(
        formData.get("k-value") as unknown as number,
        formData.get("fetch-k") as unknown as number,
        formData.get("search-type") as unknown as string,
        formData.get("query") as unknown as string,
        formData.get("embedding") as unknown as string
      );
    case "generateCode":
      return query(
        formData.get("query") as unknown as string,
        true,
        formData.get("embedding") as unknown as string
      );
    case "askQuestion":
      return query(
        formData.get("query") as unknown as string,
        false,
        formData.get("embedding") as unknown as string
      );
    default:
      return json({ error: `Unknown action type: ${actionType}` });
  }
};

export default function Index() {
  const actionData = useActionData();
  const [embedding, setEmbedding] = React.useState<string>("openai");
  const embeddingOptions = ["openai", "cohere", "mistralai"];

  return (
    <div className="max-w-2xl mx-auto ">
      <h1 className="text-lg font-semibold">Global params</h1>
      <div className="p-4 break-inside-avoid">
        <label
          htmlFor="embedding"
          className="block text-sm font-medium text-gray-700"
        >
          Embedding
        </label>
        <select
          id="embedding"
          name="embedding"
          defaultValue={embedding}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm p-2"
          onChange={(e) => setEmbedding(e.target.value)}
        >
          {embeddingOptions.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <h1 className="text-xl font-semibold">Vector Store</h1>
      <div className="container  p-4 columns-3xs">
        <Form method="post">
          <div className="break-inside-avoid">
            <h2 className="text-lg font-semibold">Splitter</h2>
            <FormSelectInput
              label="source"
              name="source"
              type="text"
              defaultValue="directory"
              options={["directory", "pdf", "website"]}
            />
            <FormTextInput
              label="Path"
              name="path"
              type="text"
              defaultValue="/home/brannt/workspace/coderagent/data/modal.com"
            />
            <FormTextInput
              label="Language"
              name="language"
              type="text"
              defaultValue="html"
            />
            <FormTextInput
              label="Chunk size"
              name="chunk-size"
              type="number"
              defaultValue="500"
            />
            <FormTextInput
              label="Chunk overlap"
              name="chunk-overlap"
              type="number"
              defaultValue="100"
            />
            <input
              type="text"
              hidden
              name="embedding"
              defaultValue={embedding}
            />
            <FormSubmitButton text="Run Splitter" value="runSplitter" />
            <FormSubmitButton text="Reindex" value="reindex" />
          </div>
        </Form>

        <Form method="post">
          <div className="break-inside-avoid">
            <h2 className="text-lg font-semibold">Retrieval</h2>
            {/* // Running retrieval with search type ${message.searchType} and k value ${message.kValue} and fetch k ${message.fetchK} and query ${message.query}`; */}
            <FormTextInput
              label="k"
              name="k-value"
              type="number"
              defaultValue="3"
            />
            <FormTextInput
              label="fetch k"
              name="fetch-k"
              type="number"
              defaultValue="3"
            />
            <FormTextInput
              label="Search type"
              name="search-type"
              type="text"
              defaultValue=""
            />
            <FormTextboxInput
              label="Query"
              name="query"
              type="text"
              defaultValue=""
            />
            <input
              type="text"
              hidden
              name="embedding"
              defaultValue={embedding}
            />
            <FormSubmitButton text="Run Retrieval" value="runRetrieval" />
          </div>
        </Form>
      </div>

      <Form method="post">
        <div className="p-4 break-inside-avoid">
          <h2 className="text-lg font-semibold">Codegen</h2>
          <FormTextboxInput
            label="Query"
            name="query"
            type="text"
            defaultValue=""
          />
          <input type="text" hidden name="embedding" defaultValue={embedding} />
          <FormSubmitButton text="Generate Code" value="generateCode" />
          <FormSubmitButton text="Ask Question" value="askQuestion" />
        </div>
      </Form>

      {actionData ? <Result result={actionData} /> : null}
    </div>
  );
}

interface InputProps {
  label: string;
  name: string;
  type?: string;
  defaultValue: string;
  options?: string[];
}
function FormTextInput({ label, name, type, defaultValue }: InputProps) {
  return (
    <>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm p-2"
      />
    </>
  );
}

function FormTextboxInput({ label, name, defaultValue }: InputProps) {
  return (
    <>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm p-2"
      />
    </>
  );
}

function FormSelectInput({ label, name, defaultValue, options }: InputProps) {
  return (
    <>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm p-2"
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
}

interface SubmitButtonProps {
  text: string;
  value: string;
}

function FormSubmitButton({ text, value }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      name="_action"
      value={value}
      className="mt-2 px-4 py-2 p-4 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-700"
    >
      {text}
    </button>
  );
}

function Result({ result }: { result: Record<string, string> }) {
  console.log(result);
  const resultKeys = Object.keys(result);
  if (resultKeys.length === 1) {
    return (
      <pre className="max-h-96 overflow-auto">{result[resultKeys[0]]}</pre>
    );
  }
  const resultString = resultKeys
    .map((key) => `${key}\n${result[key]}`)
    .join("\n\n");
  return <pre className="max-h-96 overflow-auto">{resultString}</pre>;
}
