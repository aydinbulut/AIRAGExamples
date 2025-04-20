// This example uses ChromaDB which is a vector database to store the vectors

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OllamaEmbeddingFunction } from 'chromadb';
import { ChromaClient } from "chromadb";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";

const pdfFilePath = './pdfFiles/book.pdf';
const userPrompt = 'What does this book tells?';

const chromaDBClient = new ChromaClient();
const collectionName = "pdf_vectors_attempt2";

// Embedding function for ChromaDB which is used to create vectors for the documents added to the collection
const ollama_embedding_function = new OllamaEmbeddingFunction({ url: "http://127.0.0.1:11434", model: "mxbai-embed-large" });

// Prepare the PDF file and store vectors in the vector database
// This example uses ChromaDB which is a vector database to store the vectors
// Call this function only once to create the vectors and store them in the vector database
async function processPDFAndStoreVectors(file) {

    // Step 1 - load the file data
    const loader = new PDFLoader(file);
    const pdfDocument = await loader.load();
    console.log("document is loaded");

    // Step 2 - Split the document into smaller chunks
    // This is important because the model has a token limit
    // and we need to make sure that the chunks are small enough
    // to fit into the model
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 0,
    });
    const splits = await textSplitter.splitDocuments(pdfDocument);
    console.log("document is splitted into chunks, total chunks: " + splits.length);

    // Step 3.1 - Delete the collection if it exists already
    try {
        const existingCollection = await chromaDBClient.getCollection({ name: collectionName });
        if (existingCollection) {
            await chromaDBClient.deleteCollection(existingCollection);
            console.log(`Existing collection is deleted in ChromaDB: ${collectionName}`);
        }
    } catch (error) {
        if (error.message !== "Collection not found") {
            console.error(`Error deleting existing collection: ${error.message}`);
        }
    }

    // Step 3.2 - Create the collection in the vector database and configure the embedding function
    let collection = await chromaDBClient.createCollection({
        name: collectionName,
        embeddingFunction: ollama_embedding_function
    });
    console.log("Collection created in ChromaDB");
    
    console.log("Creating and storing vectors in the vector database ChromaDB");
    // Step 3.3 - Store the vectors in the vector database collection created above
    // This is where the document chunks are converted into vectors implicitly using the 'ollama_embedding_function' function
    let splitIDCounter = 1;
    for (const doc of splits) {
        // Store the vectors in the vector database collection
        await collection.add({
            ids: ['doc-' + splitIDCounter++], // Unique ID for each document chunk
            documents: [doc.pageContent], // actual content of the document chunk
            metadatas: [{ // optional metadata for the document chunk, this can be used to filter the results in some cases
                source: doc.metadata.source,
            }]
        });
        process.stdout.write("Progress: " + (splitIDCounter - 1) + "/" + splits.length + "\r");
    }
    console.log("Progress: " + (splitIDCounter - 1) + "/" + splits.length);
    console.log("Documents are stored in ChromaDB as vectors");

    console.log("PDF File is processed and vectors are stored in the vector database");
    console.log("You can run the function 'processPDFAndStoreVectors' again to re-process the PDF file and store the vectors in the vector database");
    console.log("You can now run the function 'generateResponseWithPersistedVectors' to generate the response from LLM");
}

// Generate the response from LLM using the persisted data in the vector database as the context after the semantic search
// This example uses ChromaDB which is a vector database to store the vectors
// This is where the actual response is generated
// Call this function any number of times to generate the response
async function generateResponseWithPersistedVectors(question) {

    // Step 5 - Load the vectors from the vector database
    const collection = await chromaDBClient.getCollection({
        name: collectionName,
        embeddingFunction: ollama_embedding_function
    });
    const all = await collection.get({});
    console.log("Vectors loaded from ChromaDB");

    // Step 6 - Perform semantic search
    // This is where the actual search happens for narrowing down the context related to the question
    console.log("Semantic search started");
    const searches = await collection.query({
        queryTexts: [question],
        nResults: 75,
        include: ["documents", "metadatas", "distances", "embeddings"],
    });
    console.log("Semantic search completed");

    // Step 7 - Generate the prompt together with the context to ask LLM for response
    // Step 7.1 - Generate context
    console.log("generatePrompt started");
    let context = "";
    searches.documents.forEach((search) => {
        context = context + "\n\n" + search;
    });

    // Step 7.2 - Generate prompt template to format the context and question
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

    // Step 8 - Generate the response from LLM
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
        console.log("");
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

// import readline module
import readline from 'readline';
// ask user to select which function to run
const readlineInstance = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
readlineInstance.question('Which function do you want to run? \n1: processPDFAndStoreVectors, \n2: generateResponseWithPersistedVectors \nSelection: ', async (choice) => {
    if (choice === '1') {
        await processPDFAndStoreVectors(pdfFilePath);
    } else if (choice === '2') {
        await generateResponseWithPersistedVectors(userPrompt);
    } else {
        console.log('Invalid choice');
    }
    readlineInstance.close();
});