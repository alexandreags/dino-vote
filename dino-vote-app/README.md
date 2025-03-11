# Dino Voting App

## Overview
The Dino Voting App is a web application that allows users to view images of dinosaurs, vote for their favorites, and store the data in a MySQL database. The application fetches dinosaur images from the Pexels API and saves them to an S3-compatible storage bucket. It utilizes Node.js, Express, Prisma, and Bootstrap for a modern and responsive design.

## Features
- Fetch dinosaur images from the Pexels API using the keyword "dinosaur".
- Store image URLs and vote counts in a MySQL database.
- Upload images to an S3-compatible bucket.
- Responsive design using Bootstrap.
- User-friendly interface for voting on dinosaurs.

## Technologies Used
- Node.js
- Express
- MySQL
- Prisma
- Pexels API
- S3-compatible storage
- Bootstrap
- EJS for templating

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dino-vote-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   Copy the provided `.env` template and fill in your database credentials and API keys.

4. **Run database migrations**
   Ensure you have Prisma set up and run the following command to create the necessary database tables:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`.

## Directory Structure
```
dino-vote-app
├── src
│   ├── controllers          # Contains controller logic
│   ├── models               # Contains Prisma models
│   ├── routes               # Contains route definitions
│   ├── services             # Contains services for API interactions
│   ├── app.js               # Entry point of the application
│   └── prisma               # Contains Prisma schema
├── public                   # Static files (CSS, JS)
├── views                    # EJS view templates
├── .env                     # Environment variables
├── package.json             # NPM configuration
├── prisma                   # Prisma migrations
├── README.md                # Project documentation
└── tsconfig.json            # TypeScript configuration
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.