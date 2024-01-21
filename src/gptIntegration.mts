import { ConsoleCallbackHandler } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/runnables";
import { StringOutputParser } from "langchain/schema/output_parser";
import { BaseRetriever } from "langchain/schema/retriever";
import { formatDocumentsAsString } from "langchain/util/document";

const GENERATE_TEMPLATE = `Use the following excerpts from the product documentation to generate the code snippet
that is requested in the end. In your answer, provide only the code snippet without any additional text.
---------
{context}`;

const ANSWER_TEMPLATE = `Use the following excerpts from the product documentation to answer the question in the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;

export class GPTIntegration {
    async generateCode(retriever: BaseRetriever, query: string): Promise<string> {
        return await this.invokeChain(GENERATE_TEMPLATE, retriever, query);
    }

    private async invokeChain(template: string, retriever: BaseRetriever, query: string): Promise<string> {
        const model = new ChatOpenAI({temperature: 0, callbacks: [new ConsoleCallbackHandler()]});
        const messages = [
            SystemMessagePromptTemplate.fromTemplate(template),
            HumanMessagePromptTemplate.fromTemplate('{query}')
        ];
        const prompt = ChatPromptTemplate.fromMessages(messages);
        const chain = RunnableSequence.from([
            {
                context: async (input: {query: string}) => {
                    const relevantDocs = await retriever.getRelevantDocuments(input.query);
                    return formatDocumentsAsString(relevantDocs);
                },
                query: (input: {query: string}) => input.query,
            },
            prompt,
            model,
            new StringOutputParser(),
        ]);
        const response =  await chain.invoke({query});
        console.log(response);
        return response;
    }

    async answerQuestion(retriever: BaseRetriever, query: string): Promise<string> {
        return await this.invokeChain(ANSWER_TEMPLATE, retriever, query);
    }
}
