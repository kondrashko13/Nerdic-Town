const fs = require('fs');
const User = require('../user/user');
const Boardgame = require('../boardgame/boardgame');
const {sign} = require("jsonwebtoken");

const checkAdmin = (context) => {
    if (!context.user || context.user.role !== 'admin') {
        throw new Error('Access denied. Admins only.');
    }
};

const resolvers = {
    Query: {
        profile: async (_, __, context) => {
            if (!context.user) throw new Error('Unauthorized');

            const user = await User.findById(context.user.userId)
                .select('-password')
                .populate('cart.productId');
            if (!user) throw new Error('User not found');
            return user;
        },
        users: async (_, __, context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new Error('Access denied. Admins only.');
            }
            return User.find().select('-password');
        },

        boardgames: async () => {
            return Boardgame.find();
        },

        boardgame: async (_, { id }) => {
            const product = await Boardgame.findById(id);
            if (!product) throw new Error('Boardgame not found');
            return product;
        }
    },
    Mutation: {
        updateProfile: async (_, { email }, context) => {
            if (!context.user) throw new Error('Unauthorized');

            return User.findByIdAndUpdate(
                context.user.userId,
                {email},
                {new: true, runValidators: true}
            ).select('-password');
        },
        makeAdmin: async (_, { id }, context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new Error('Access denied. Admins only.');
            }

            return User.findByIdAndUpdate(
                id,
                {role: 'admin'},
                {new: true, runValidators: true}
            ).select('-password');
        },
        deleteUser: async (_, { id }, context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new Error('Access denied. Admins only.');
            }

            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) throw new Error('User not found');

            if (context.user.userId === id) {
                context.res.clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
            }
            return true;
        },
        seedBoardgames: async (_, __, context) => {
            checkAdmin(context);

            const data = fs.readFileSync('./data/boardgames.json', 'utf-8');
            const boardGames = JSON.parse(data);

            await Boardgame.deleteMany();
            const importedGames = await Boardgame.insertMany(boardGames);

            return {
                message: 'Database seeded successfully',
                count: importedGames.length
            };
        },

        createBoardgame: async (_, args, context) => {
            checkAdmin(context);

            const newProduct = new Boardgame(args);
            return await newProduct.save();
        },

        updateBoardgame: async (_, args, context) => {
            checkAdmin(context);

            const { id, ...updateData } = args;

            const updatedProduct = await Boardgame.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedProduct) throw new Error('Boardgame not found');
            return updatedProduct;
        },

        deleteBoardgame: async (_, { id }, context) => {
            checkAdmin(context);

            const deletedProduct = await Boardgame.findByIdAndDelete(id);
            if (!deletedProduct) throw new Error('Boardgame not found');

            return true;
        },
        register: async (_, { email, password }) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }

            const user = new User({ email, password });
            await user.save();

            return {
                message: 'User registered successfully',
                userId: user._id
            };
        },

        login: async (_, { email, password }, context) => {
            const user = await User.findOne({ email });
            if (!user) throw new Error('Invalid email or password');

            const isMatch = await user.comparePassword(password);
            if (!isMatch) throw new Error('Invalid email or password');

            const token = sign(
                {
                    userId: user._id,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: '12h' }
            );

            context.res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 12 * 60 * 60 * 1000
            });

            return {
                message: 'Login successful',
                userId: user._id,
                role: user.role
            };
        },

        logout: async (_, __, context) => {
            context.res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return { message: 'Logged out successfully' };
        }
    }
};

module.exports = resolvers;