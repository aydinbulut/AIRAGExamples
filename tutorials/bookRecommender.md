# What is it?

This example show how some other books can be recommended to users based on their previously read books.

1. Creates synthetic data for books library, without actual content
    1. Title, author, renge, publisher, publishDate, pages, bookFormat are the information available.
2. Stores the book library in `ChromaDB`
3. Picks some of them as previously read books
4. Does `semantic` search to find similar books
5. Returns the similar books after filtering to discard already read ones.