const typeDefs = `#graphql
  type CartItem {
    id: ID!
    productId: ID! 
    quantity: Int!
  }

  type User {
    id: ID!
    email: String!
    role: String!
    cart: [CartItem]
  }

  type Boardgame {
    id: ID!
    name: String!
    image: String!
    players: String!
    playtime: Int!
    age: String!
    description: String!
    createdAt: String
    updatedAt: String
  }

  type SeedResponse {
    message: String!
    count: Int!
  }
  
  type AuthResponse {
    message: String!
    userId: ID
    role: String
  }

  type Query {
    # User Queries
    profile: User
    users: [User!]!
    
    # Boardgame Queries (Public)
    boardgames: [Boardgame!]!
    boardgame(id: ID!): Boardgame
  }

  type Mutation {
    # User Mutations
    updateProfile(email: String!): User
    makeAdmin(id: ID!): User
    deleteUser(id: ID!): Boolean

    # Boardgame Mutations (Admin Only)
    seedBoardgames: SeedResponse!
    
    createBoardgame(
        name: String!
        image: String!
        players: String!
        playtime: Int!
        age: String!
        description: String!
    ): Boardgame!
    
    updateBoardgame(
        id: ID!
        name: String
        image: String
        players: String
        playtime: Int
        age: String
        description: String
    ): Boardgame!
    
    deleteBoardgame(id: ID!): Boolean!
    register(email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
    logout: AuthResponse!
  }
`;

module.exports = typeDefs;