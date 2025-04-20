import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";

const file = './pdfFiles/book-shortest.pdf';
const question = 'What is the book about?';

async function main() {
    // Step 1 - load the uploaded file data
    console.log("loadTheDoc started");
    const loader = new PDFLoader(file);
    const docs = await loader.load();
    console.log("loadTheDoc completed");

    // Step 2 - Split the document into smaller chunks
    // This is important because the model has a token limit
    // and we need to make sure that the chunks are small enough
    // to fit into the model
    console.log("splitTheDoc started");
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 250,
        chunkOverlap: 0,
    });
    const splits = await textSplitter.splitDocuments(docs);
    console.log("splitTheDoc completed, total chunks: " + splits.length);

    // Step 3 - Vectorize the document chunks
    // This is where the document chunks are converted into vectors
    // using the embedding model
    // The embedding model can be changed like this -> new OllamaEmbeddings({model:'nomic-embed-text'});
    // The vector store is a memory vector store, so it will only be available in memory
    // The vector store is used to perform semantic search
    console.log("vectorization started");
    const embeddings = new OllamaEmbeddings();
    const vectorStore = await MemoryVectorStore.fromDocuments(
        splits,
        embeddings
    );
    console.log("vectorization completed");

    // Step 4 - Perform semantic search
    // This is where the actual search happens for narrowing down the context related to the question
    console.log("Semantic search started");
    const searches = await vectorStore.similaritySearch(question);
    console.log("Semantic search completed");

    // Step 5 - Generate the prompt together with the context to ask LLM for response
    // Step 5.1 - Generate context
    console.log("generatePrompt started");
    let context = "";
    searches.forEach((search) => {
        context = context + "\n\n" + search.pageContent;
    });

    // Step 5.2 - Generate prompt template to format the context and question
    const promptTemplate = PromptTemplate.fromTemplate(`
    Answer the question based only on the following context:
    
    {context}
    
    ---
    
    Answer the question based on the above context: {question}
    `);

    const prompt = await promptTemplate.format({
        context: context,
        question: question,
    });
    console.log("generatePrompt completed");

    // Step 6 - Generate the response from LLM
    // This is where the actual response is generated
    console.log("generateResponse started");
    const stream = true;
    if (stream) {
        const ollamaLlm = new ChatOllama({
            baseUrl: "http://localhost:11434", // Default value
            model: "llama3.2:latest" // Default value
        });

        const responseStream = await ollamaLlm.stream(prompt);

        for await (const chunk of responseStream) {
            process.stdout.write(chunk.content);
        }
    } else {
        const ollamaLlm = new ChatOllama({
            baseUrl: "http://localhost:11434", // Default value
            model: "llama3.2:latest", // Default value
            stream: false
        });

        const response = await ollamaLlm.invoke(prompt);
        console.log(response.content);
    }
    console.log("generateResponse completed");
}
main();