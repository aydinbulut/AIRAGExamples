# Intro
This example uses ChromaDB to persist the embeddings. So the processed PDF embeddings won't be lost until explcitly removed from the ChromaDB.

# Requirements
This example needs
- `Ollama` for generating embeddings(vector) for semantic search, and also for generating LLM response. Used version `0.6.5`
    - Model `mxbai-embed-large` is needed for creating embeddings
    - Model `llama3.2` is needed to generate LLM response
- `ChromaDB` for storing embbedings(vectors) of the PDF file after processing once. Used version `1.0.0`
- `NodeJS` of course :) Used version `20.15.0`

# Get started
- Start `Ollama` and load `llama3.2` model
- Start `ChromaDB`
- Run `npm i`
- Run `node pdfContextWithVectorDB.js`

# Runtime
- You will be requested to select either option `1:processPDFAndStoreVectors` or option `2:generateResponseWithPersistedVectors`
- Option 1 will process the PDF file to create embeddings(vectors) and store them in `ChromaDB`. 
    - Run this only once!
    - Check the code to see how embeddings generated and stored.
    - Took aroun 90 seconds with Apple M1 PRO CPU & 32GB RAM
- Option 2 will ask the question hardcoded to the LLM together with providing the context.
    - Check the code to see how sematic search is done.