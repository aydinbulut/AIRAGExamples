# Intro
This example uses `langchain/tools/webbrowser` package to get `fetch` content, `split` to chunks, `create` embeddings(vectors) of the chunks, and `generate response` from LLM. The package handles all these things.

# Requirements
This example needs
- `Ollama` for generating embeddings(vector) for semantic search, and also for generating LLM response. Used version `0.6.5`
    - Model `mxbai-embed-large` is needed for creating embeddings which is default model required by `@langchain/ollama/OllamaEmbeddings` class
    - Model `llama3.2` is needed to generate LLM response
- `NodeJS` of course :) Used version `20.15.0`

# Get started
- Start `Ollama` and load `llama3.2` model
- Run `npm i`
- Run `node webPageSummary.js`