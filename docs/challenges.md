# Challenges

### Backend Challenges and Insights

1. Time Management and Skill Acquisition
   Challenge: The primary challenge was managing time effectively during the festive season, a period typically demanding on both a personal and professional level as I currently have a role working on both (Nextjs and React native) and had a team dependent on me. Additionally, transitioning from my primary expertise in JavaScript to Python presented a steep learning curve.

Solution: To mitigate this, I leveraged my existing JavaScript skills to complement areas where Python development was slower due to the learning process. This approach ensured that project deadlines were met without compromising on quality.

Insight: This experience shows the importance of flexibility in technology choice and the ability to quickly adapt to new languages and frameworks.

2. Server Timeout in Computation-Intensive Tasks
   Challenge: Handling large computations in the backend led to server timeouts, disrupting the delivery of summaries to the client.

Solution: Implemented WebSockets for real-time, bi-directional communication and asynchronous processing, which efficiently managed lengthy computations without causing timeouts.

Insight: This solution highlighted the effectiveness of WebSockets in handling long-running tasks and the benefits of asynchronous programming in Python for enhancing backend performance.

3. Docker Integration with Python
   Challenge: Integrating Docker with the Python-based backend was initially challenging, mainly due to my more profound familiarity with JavaScript environments.

Solution: By diligently studying Docker documentation and experimenting with different setups, I was able to create a Dockerfile that effectively containerized the FastAPI application. This setup ensured that the application could be easily deployed and run on any machine.

Insight: This task highlighted the importance of containerization in modern software development, offering insights into building scalable and portable applications.

### Backend Code Explanation

1. FastAPI Application: The core of the backend is a FastAPI application, which is lightweight, fast, and easy to use, making it an ideal choice for building efficient APIs.
   WebSockets for Real-time Communication: Utilized WebSocket protocol to handle real-time, bi-directional communication between the server and clients, particularly useful for long-running tasks like document summarization.

2. CORS Middleware: Integration of CORS middleware ensures smooth interaction between the backend and frontends built with frameworks like React and Next.js, by handling cross-origin requests.

3. Async File Handling: Asynchronous programming techniques are employed for file handling, improving the efficiency of I/O-bound operations.

4. Document Loader Utilization: Leveraging PyPDFLoader and CSVLoader from langchain for processing different document types, enhancing the application's versatility in handling various file formats.

5. Language Model Integration: The use of ChatOpenAI with the gpt-3.5-turbo-1106 model from langchain demonstrates the incorporation of advanced NLP models for tasks like text summarization.

6. Dockerization: Containerizing the FastAPI application with Docker, which simplifies deployment and ensures consistent performance across different environments.

### Backend Code - Future Improvements

Given more time and resources, I would focus on the following areas for backend improvement:

1. Enhanced NLP Features: Implement additional functionalities like text classification, extracting quantitative information, and categorizing document passages.

2. Optimization and Scaling: Further optimize the backend for performance and scalability, ensuring it can handle a higher volume of requests and larger datasets.

3. Advanced Error Handling: Develop a more robust error-handling mechanism to improve the API's reliability and user experience.

4. Automated Testing: Integrate a comprehensive suite of automated tests to ensure code reliability and facilitate smoother future updates.

5. Estimated summary time: Inplement features that shows the estimation time of summarization, which would improve the user's experience.

6. Texting: Add unit tests for critical functions.

## Frontend Challenges and Insights

1. Integration of Diverse Libraries
   Challenge: One of the main challenges in the frontend development was integrating a wide range of libraries and tools, ensuring they work seamlessly together. This includes state management, UI components, and interacting with backend services.

Solution: By carefully choosing libraries like @mantine/hooks for state management and @radix-ui for UI components, I ensured a cohesive and efficient development process. Utilizing @trpc facilitated seamless data fetching and state synchronization between the frontend and the backend.

Insight: This process highlighted the importance of selecting the right libraries that align with the project's goals and ensuring they integrate well within the existing ecosystem.

2. Implementing Authentication with Kinde
   Challenge: Implementing a secure and user-friendly authentication system was crucial. The use of @kinde-oss/kinde-auth-nextjs presented a learning curve in terms of integration and configuration.

Solution: By thoroughly understanding Kinde's documentation and leveraging Next.js's capabilities, I successfully integrated a robust authentication system.

Insight: This task shows the significance of secure and efficient user authentication in modern web applications, enhancing user trust and application security.

### Frontend Code Explanation

1. Next.js: Provides the core framework for building the user interface, chosen for their robustness and community support.
2. State Management and Data Fetching: Libraries like @tanstack/react-query and @trpc are used for efficient data handling and server-state management.
3. UI Components: The use of @radix-ui components contributes to a consistent and accessible user interface.
4. Styling: Tailwind CSS is used for its utility-first approach, making the styling process more streamlined and maintainable.
5. Authentication: @kinde-oss/kinde-auth-nextjs is integrated for a secure and seamless authentication experience.
6. Form Handling: react-hook-form and @hookform/resolvers are utilized for efficient form validations.
7. File Uploads: Integration with @uploadthing/react for handling file uploads.
8. vector database: Pinecone for story vector and performing similarity search.
9. Web sockets: WebSockets for real-time, bi-directional communication and asynchronous processing, which efficiently managed lengthy computations without causing timeouts.
10. Other Utilities: Additional libraries like date-fns for date operations, papaparse for CSV parsing, and react-pdf for PDF handling, enhancing the application’s capabilities.

### Frontend Code - Future Improvements

Given more time and resources, I would focus on the following areas for backend improvement:

1. Enhanced NLP Features: Implement additional functionalities like text classification, extracting quantitative information, and categorizing document passages.

2. Optimization and Scaling: Further optimize the frontend for performance and scalability, ensuring it can handle a higher volume of requests and larger datasets.

3. Advanced Error Handling: Develop a more robust error-handling mechanism to improve the user experience.

4. Estimated summary time: Inplement features that shows the estimation time of summarization, which would improve the user's experience.

5. Database storage: split latge data that can't be saved to prisma in chunks, so as to enable user see their previous large summary data.

6. Texting: Add unit tests for critical functions.

