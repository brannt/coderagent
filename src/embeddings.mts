import { CohereEmbeddings } from "@langchain/cohere";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const EMBEDDINGS: Record<string, any> = {
  "cohere": CohereEmbeddings,
  "mistralai": MistralAIEmbeddings,
  "openai": OpenAIEmbeddings,
};

export function getEmbeddings(name: string): CohereEmbeddings | MistralAIEmbeddings | OpenAIEmbeddings {
    switch (name) {
        case "cohere":
            return new CohereEmbeddings();
        case "mistralai":
            return new MistralAIEmbeddings();
        case "openai":
            return new OpenAIEmbeddings();
        default:
            throw new Error(`Embeddings ${name} not found.`);
    }
}