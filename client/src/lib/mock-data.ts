// Mock data for demonstration purposes

export const users = [
  {
    id: 1,
    name: 'John Farmer',
    username: 'johnfarmer',
    email: 'john@example.com',
    role: 'farmer',
    profileImage: 'https://ui-avatars.com/api/?name=John+Farmer'
  },
  {
    id: 2,
    name: 'Jane Supplier',
    username: 'janesupplier',
    email: 'jane@example.com',
    role: 'supplier',
    profileImage: 'https://ui-avatars.com/api/?name=Jane+Supplier'
  },
  {
    id: 3,
    name: 'Mike Buyer',
    username: 'mikebuyer',
    email: 'mike@example.com',
    role: 'buyer',
    profileImage: 'https://ui-avatars.com/api/?name=Mike+Buyer'
  },
  {
    id: 4,
    name: 'Sarah Admin',
    username: 'sarahadmin',
    email: 'sarah@example.com',
    role: 'admin',
    profileImage: 'https://ui-avatars.com/api/?name=Sarah+Admin'
  },
  {
    id: 5,
    name: 'David Jones',
    username: 'davidjones',
    email: 'david@example.com',
    role: 'farmer',
    profileImage: 'https://ui-avatars.com/api/?name=David+Jones'
  },
];

export const mockChats = [
  {
    id: 'chat-1',
    members: [1, 2],
    name: 'Jane Supplier',
    lastMessage: {
      text: 'Do you have any organic fertilizers in stock?',
      createdAt: '2023-08-15T10:23:00Z',
      user: {
        id: 1,
        name: 'John Farmer'
      }
    }
  },
  {
    id: 'chat-2',
    members: [1, 3],
    name: 'Mike Buyer',
    lastMessage: {
      text: 'I\'m interested in your tomato harvest. When will it be ready?',
      createdAt: '2023-08-14T16:45:00Z',
      user: {
        id: 3,
        name: 'Mike Buyer'
      }
    }
  },
  {
    id: 'chat-3',
    members: [1, 4],
    name: 'Sarah Admin',
    lastMessage: {
      text: 'Your account verification is complete.',
      createdAt: '2023-08-10T09:12:00Z',
      user: {
        id: 4,
        name: 'Sarah Admin'
      }
    }
  }
];