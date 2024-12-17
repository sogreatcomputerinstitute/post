const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Path to store the posts
const POSTS_FILE = './posts.txt';

// Utility function to read posts from the file
const readPosts = () => {
    if (!fs.existsSync(POSTS_FILE)) {
        return [];
    }
    const data = fs.readFileSync(POSTS_FILE, 'utf-8');
    return data.split('\n')
        .map(line => {
            const [userName, content] = line.split('|');
            return userName && content ? { userName, content } : null; // Return null if incomplete
        })
        .filter(post => post !== null); // Filter out any invalid posts
};

// Utility function to truncate content safely
const truncateContent = (content) => {
    if (!content) return ''; // Return empty string if content is undefined or empty
    return content.length > 200 ? content.slice(0, 200) + '...' : content;
};

// Route to display posts and the form
app.get('/', (req, res) => {
    const posts = readPosts();
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Post Your Thoughts</title>
        </head>
        <style>
        * Global Styles */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            height: 100vh;
            padding-top: 50px;  /* Add top padding for spacing */
        }
        
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 90%;
            max-width: 800px; /* Set a max-width for the container */
            overflow: hidden;
        }
        
        /* Header Styles */
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }
        
        /* Form Styles */
        form {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
        }
        
        input[type="text"], textarea {
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
            margin-bottom: 10px;
            font-size: 16px;
            width: 100%; /* Make input fields full width of the container */
        }
        
        button {
            padding: 10px;
            border: none;
            background-color: #4CAF50;
            color: white;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        button:hover {
            background-color: #45a049;
        }
        
        /* Posts List */
        h2 {
            color: #333;
            font-size: 1.2rem;
            margin-bottom: 10px;
        }
        
        .post {
            background-color: #f9f9f9;
            border-left: 5px solid #4CAF50;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
            word-wrap: break-word; /* Ensure text wraps inside the post */
            white-space: pre-wrap; /* Allows content to break into multiple lines */
        }
        
        .post p {
            margin: 0;
            font-size: 16px;
            color: #555;
        }
        
        .post strong {
            font-weight: bold;
            color: #333;
        }
        
        a {
            color: #4CAF50;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        /* Responsive Design */
        @media (max-width: 600px) {
            input[type="text"], textarea, button {
                font-size: 14px;
            }
        }
        </style>
        <body>
            <div class="container">
                <h1>Post Your Thoughts</h1>
                <form action="/submit" method="POST">
                    <input type="text" name="userName" placeholder="Enter your name" required><br><br>
                    <textarea name="postContent" placeholder="Write your post here..." rows="5" required></textarea><br><br>
                    <button type="submit">Submit Post</button>
                </form>

                <h2>Previous Posts:</h2>
                <div id="posts">
                    ${posts.map(post => `
                        <div class="post">
                            <p><strong>${post.userName}</strong>: ${truncateContent(post.content)}</p>
                            ${post.content.length > 200 ? `<a href="/read-more/${post.userName}">Read more...</a>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `);
});

// Route to handle post submission
app.post('/submit', (req, res) => {
    const { userName, postContent } = req.body;
    
    // Validate inputs (simple check)
    if (!userName || !postContent) {
        return res.status(400).send('Both name and content are required!');
    }
    
    // Save the new post to the file
    const newPost = `${userName}|${postContent}\n`;

    fs.appendFileSync(POSTS_FILE, newPost);
    
    // After submitting, redirect back to the home page
    res.redirect('/');
});

// Route to display full post (optional "Read more" feature)
app.get('/read-more/:userName', (req, res) => {
    const { userName } = req.params;
    const posts = readPosts();
    const post = posts.find(p => p.userName === userName);
    
    if (post) {
        res.send(`
            <html>
            <head>
            <link rel="stylesheet" href="style.css">
                <title>Post by ${post.userName}</title>
            </head>
            <body>
            <style>
            * Global Styles */
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                height: 100vh;
                padding-top: 50px;  /* Add top padding for spacing */
            }
            
            .container {
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                padding: 20px;
                width: 90%;
                max-width: 800px; /* Set a max-width for the container */
                overflow: hidden;
            }
            
            /* Header Styles */
            h1 {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
            }
            
            /* Form Styles */
            form {
                display: flex;
                flex-direction: column;
                margin-bottom: 20px;
            }
            
            input[type="text"], textarea {
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ccc;
                margin-bottom: 10px;
                font-size: 16px;
                width: 100%; /* Make input fields full width of the container */
            }
            
            button {
                padding: 10px;
                border: none;
                background-color: #4CAF50;
                color: white;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            button:hover {
                background-color: #45a049;
            }
            
            /* Posts List */
            h2 {
                color: #333;
                font-size: 1.2rem;
                margin-bottom: 10px;
            }
            
            .post {
                background-color: #f9f9f9;
                border-left: 5px solid #4CAF50;
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 5px;
                word-wrap: break-word; /* Ensure text wraps inside the post */
                white-space: pre-wrap; /* Allows content to break into multiple lines */
            }
            
            .post p {
                margin: 0;
                font-size: 16px;
                color: #555;
            }
            
            .post strong {
                font-weight: bold;
                color: #333;
            }
            
            a {
                color: #4CAF50;
                text-decoration: none;
            }
            
            a:hover {
                text-decoration: underline;
            }
            
            /* Responsive Design */
            @media (max-width: 600px) {
                input[type="text"], textarea, button {
                    font-size: 14px;
                }
            }
            </style>
                <div class="container">
                    <h1>Post by ${post.userName}</h1>
                    <p>${post.content}</p>
                    <a href="/">Back to all posts</a>
                </div>
            </body>
            </html>
        `);
    } else {
        res.status(404).send('Post not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
