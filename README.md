INFR3120 Project Part 1
November 12/13th 
Tabitha Hannas 
Created Repo, created index.html, styles.css, and script.js
Created homepage with 4 sections -> Header, footer, sidebar, main modal
Added team logo to page header
Created "Add task" popup with an open form with Javascript
Added CRUD features to : Add subject or task, Edit task, delete subject or task.

· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·· · ─ ·✶· ─ · ·

INFR3120 Project Part 2
Date: Nov 23/24 
Tabitha Hannas

Implemented full user registration and login functionality using MongoDB/Mongoose for user storage and JWT (JSON Web Tokens) for session management.
Ensured all data modification routes (Add, Edit, Delete Task/Subject) are protected via backend middleware that verifies the user's token before allowing database access.
Refactored navigation across all pages (index.html, login.html, register.html) to dynamically display Logout (when signed in) or Login/Register links (when signed out).
Successfully configured the application for hosting on a cloud service (Render), ensuring the server serves both the API routes and the static HTML/CSS/JS frontend files.

Issues encountered and troubleshooting
Corrected file casing inconsistency for models (task to Task.js) to prevent server crashes and deployment failures.
Debugged and corrected the 404 Not Found error by configuring server.js to correctly link the Frontend API calls (/api/tasks) to the Backend Express routes.
Addressed issues where the website failed to load by unifying the file structure (public folder) and ensuring the Node server properly served the static HTML files.
Debugged and resolved the recurring "Token is not valid" error by confirming the consistency of the JWT_SECRET environment variable on the production server.

Citations for code errors and JWT authentication
https://www.youtube.com/watch?v=5fb2aPlgoys 
https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener 
https://www.freecodecamp.org/news/the-javascript-dom-manipulation-handbook/ 
https://www.youtube.com/watch?v=mbsmsi7l3r4 
https://expressjs.com/en/guide/using-middleware.html 
https://expressjs.com/en/starter/static-files.html 
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS 


