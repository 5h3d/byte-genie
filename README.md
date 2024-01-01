BYTE an app for document interaction

## Introduction

This application enables users to interact with documents through natural language. The primary functionality is generating abstracts, short summaries and Questions and answers for entire documents using a fine-tuned BART (Bidirectional and Auto-Regressive Transformers) model.

Objective
The goal is to create an application for various document-related tasks, with a focus on writing abstracts or short summaries for entire documents and questions and answering of document, utilizing advanced NLP techniques.

## Features

- A Beautiful And Highly Functional PDF and csv Viewer
- 🔄Streaming API Responses in Real-Time
- Authentication Using Kinde
- Clean UI Using 'shadcn-ui'
- Optimistic UI Updates for a Great UX
- Infinite Message Loading for Performance
- Drag n’ Drop Uploads
- Instant Loading States
- Data Fetching Using tRPC & Zod
- LangChain for Infinite AI Memory
- Pinecone as our Vector Storage
- Prisma as our ORM
- 100% written in TypeScript
- Python backend

### Backend Technologies

1. FastAPI: A modern, fast web framework for building APIs with Python 3.7+, offering robust features and easy asynchronous programming.
2. BART: A transformer-based model for natural language processing, pre-trained on a large corpus of text.
3. Pydantic: Utilized for data validation and settings management using Python type annotations.
4. Transformers Library (Hugging Face): Employed for utilizing and fine-tuning pre-trained NLP models.
5. Datasets Library (Hugging Face): For loading and processing datasets in a streamlined manner.
6. Torch: An open-source machine learning library, used for training and inference of the BART model.
7. Uvicorn: An ASGI server for hosting the FastAPI application.
8. CORS Middleware: To handle Cross-Origin Resource Sharing in FastAPI.

### Frontend Technologies
1. Next.js: A React framework for server-rendered and static web applications.
2. Radix UI Components: Various UI components for building a rich interface.
3. Mantine Hooks: Custom hooks for state and logic management.
4. Tailwind CSS and Related Plugins: For styling the application.
5. TRPC: A suite of libraries for end-to-end typesafe APIs, integrated with React Query for efficient data fetching and state synchronization.
6. Prisma: Next-generation ORM for Node.js and TypeScript.
7. Zod: For TypeScript-first schema validation.
8. Various Utility and Styling Libraries: Such as clsx, date-fns, react-hook-form, simplebar-react, etc.

[installations and configurations](docs/installations.md)
[Challendes and improvements](docs/architecture.md)


## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


<!-- CONTACT -->

## Contact

Udeh Shedrack - udehshedrack.u@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>
