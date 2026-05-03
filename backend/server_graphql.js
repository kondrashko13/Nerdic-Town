require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const {ApolloServer} = require("@apollo/server");
const {expressMiddleware} = require("@as-integrations/express5");

const typeDefs = require("./features/graphql/typeDefs");
const resolvers = require("./features/graphql/resolvers");
const {verify} = require("jsonwebtoken");

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const app = express();

        app.use(cors({
            origin: 'http://localhost:4200',
            credentials: true
        }));
        app.use(express.json());
        app.use(cookieParser());

        const server = new ApolloServer({
            typeDefs,
            resolvers
        });

        await server.start();

        app.use(
            '/graphql',
            expressMiddleware(server, {
                context: async ({req, res}) => {
                    const token = req.cookies?.token;
                    let user = null;

                    if (token) {
                        try {
                            user = verify(token, process.env.JWT_SECRET);
                        } catch (err) {
                            console.log("Invalid token ignored");
                        }
                    }

                    return {user, res};
                },
            })
        );

        app.listen(process.env.GRAPHQL_PORT || 4000, () => {
            console.log(`GraphQL Server is running...`);
        });

    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();