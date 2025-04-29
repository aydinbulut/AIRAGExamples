import { createRandomBooks } from '../utils/syntheticData.js';
import { ChromaClient } from 'chromadb';
import { OllamaEmbeddingFunction } from 'chromadb';

// Step 1 - Create 50 synthetic books
const books = createRandomBooks(50);

// Step 2 - Create a ChromaDB collection and add the books to it
// Embedding function for ChromaDB which is used to create vectors for the documents added to the collection
const ollama_embedding_function = new OllamaEmbeddingFunction({ url: "http://127.0.0.1:11434", model: "mxbai-embed-large" });

// Create a new ChromaDB client
const chromaDBClient = new ChromaClient();

// Create a new collection in ChromaDB, if it exists, delete it first
const collectionName = "books";
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

// Create the collection in the vector database and configure the embedding function
const collection = await chromaDBClient.createCollection({
    name: collectionName,
    embeddingFunction: ollama_embedding_function
});
console.log("Collection created in ChromaDB");

// Create vectors for the books and store them in the vector database
for (const book of books) {
    await collection.add({
        ids: [book.id],
        documents: [JSON.stringify(book)]
    });
}
console.log("Vectors created and stored in the vector database");


// Step 3 - Query the vector database to find similar books to the previously read books

// Pick 3 random books from the list of books as previously read books
const previouslyReadBooks = books.sort(() => 0.5 - Math.random()).slice(0, 3);

// Query the vector database to find similar books
const queryResults = await collection.query({
    queryEmbeddings: await ollama_embedding_function.generate(previouslyReadBooks.map((book) => JSON.stringify(book))),
    nResults: 8
});

// Extract the query texts from the recommended books result
const recommendedBooks = queryResults.documents[0].map((book) => {
    return JSON.parse(book);
});

// Discard the previously read books from the results in order not to recommend them again
const notReadRecommendations = recommendedBooks.filter((book) => {
    return !previouslyReadBooks.some((readBook) => {
        return readBook.id === book.id;
    });
});


console.log('All books list', books.map((book) => JSON.stringify(book)));
console.log("Previously read books list:", previouslyReadBooks.map((book) => JSON.stringify(book)));
console.log('Recommended books list', notReadRecommendations.map((book) => JSON.stringify(book)));