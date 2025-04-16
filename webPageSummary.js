'use strict';

import { WebBrowser } from 'langchain/tools/webbrowser';
import { ConsoleCallbackHandler } from '@langchain/core/tracers/console';
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

(async () => {
    try {
        // Split the HTML content into chunks so that the context is not exceeding the token limit
        const htmlSplitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
            chunkSize: 100,
            chunkOverlap: 0,
        });

        const browser = new WebBrowser({
            model: new ChatOllama({ model: 'llama3.2', temperature: 0, streaming: true }),
            embeddings: new OllamaEmbeddings({}),
            textSplitter: htmlSplitter,
            callbacks: [new ConsoleCallbackHandler()],
        });

        const url = 'https://www.themarginalian.org/2015/04/09/find-your-bliss-joseph-campbell-power-of-myth'; // Replace with the URL you want to summarize
        const prompt = 'summarize the weppage content'; // Replace with your prompt
        
        const resultStream = await browser.invoke(`"${url}", "${prompt}"`);
        console.log(resultStream);
    } catch (error) {
        console.error('Error during RAG process:', error);
    }
})();

