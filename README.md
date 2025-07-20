# What is this repo for?

I created this repo to collect my experiments with AI solutions. Especially for 'Retrievel Augmented Generation(RAG)'.

It contains some RAG examples, but also examples about how vector databe can be used for, or concepts for RAG solutions.

# RAG Examples & Concepts

This examples using 

1. `LangChain`(framework to speedup development to create an AI powered solutions)
2. `ChromaDB` vector database to store vector embeddings.
3. `Ollama` to run models and send promopts to generate response
4. `LangSmith` to debug promopts to LLMs and responses from LLms. (Optional)


## rag/tutorials

### 1. pdfContext.js

This examples; 
1. `loads` a small PDF to memory to work on it. 
2. `splits` the pdf content into chunks by charachter longs. 
3. Creates a in-memory `vector store`
    1. Creates `vector embeddings` for the chunks of the PDf file
    2. `Stores` them in the in-memory vector store
4. Runs a `semantic` search in vector db for a given query(prompt from a user)
    1. This search tries to figures out which chunks from the PDF are related to the query, then returns only those chunks.
5. Sends the `chunks` from PDF and the `prompt` of the user LLM model Llama3.2 to generate answer for the question of the user.


### 2. pdfContextWithVectorDB

This example does the same thing done in `pdfContext.js`, but it uses `ChromaDB` to persist vector embeddings for the PDF chunks. It hanles the process in 2 phases.

1. Preparation; creates vector embeddings for the PDF chunks for once
2. Query; queries the chunks from vector DB anytime when there is a promopt


### 3. webPageSummary

Creates a summary for a given web page

### 4. agent

Simple example of creating an agent with LangGraph which handles the tool calling part instead of doing it explicitly unlikely it is the case in llmWithTools example.


## rag/concepts

### 1. decomposition.js

Explains decomposition concept and provides an example for sequential decomposition.


# Other examples

## tutorials

### 1. bookRecommender.js

Shows an example of how books can be recommended based onthe previously read books.


### 2. conversationWithLLM.js

Shows a simple example how easily a chat with LLM together with a history can be implemented in its simplest version.