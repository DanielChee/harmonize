// Mock chat data for development and testing
export interface MockMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface MockConversation {
  id: string;
  matchedUser: {
    id: string;
    name: string;
    avatar: string;
    age: number;
    city: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isNewMatch: boolean;
  concert?: {
    artist: string;
    date: string;
  };
}

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: '1',
    matchedUser: {
      id: 'user-1',
      name: 'Sarah',
      avatar: 'https://i.pravatar.cc/300?img=45',
      age: 22,
      city: 'Atlanta, GA',
    },
    lastMessage: 'Sounds great! See you there!',
    lastMessageTime: '2m ago',
    unreadCount: 0,
    isNewMatch: false,
    concert: {
      artist: 'Taylor Swift',
      date: 'Dec 15',
    },
  },
  {
    id: '2',
    matchedUser: {
      id: 'user-2',
      name: 'Mike',
      avatar: 'https://i.pravatar.cc/300?img=13',
      age: 24,
      city: 'Atlanta, GA',
    },
    lastMessage: 'Hey! Are you still interested in going to the Laufey concert?',
    lastMessageTime: '1h ago',
    unreadCount: 2,
    isNewMatch: true,
    concert: {
      artist: 'Laufey',
      date: 'Nov 9',
    },
  },
  {
    id: '3',
    matchedUser: {
      id: 'user-3',
      name: 'Emma',
      avatar: 'https://i.pravatar.cc/300?img=26',
      age: 21,
      city: 'Atlanta, GA',
    },
    lastMessage: 'I love Tame Impala! Would love to meet up before the show.',
    lastMessageTime: '3h ago',
    unreadCount: 1,
    isNewMatch: false,
    concert: {
      artist: 'Tame Impala',
      date: 'Oct 25',
    },
  },
  {
    id: '4',
    matchedUser: {
      id: 'user-4',
      name: 'Jordan',
      avatar: 'https://i.pravatar.cc/300?img=5',
      age: 23,
      city: 'Atlanta, GA',
    },
    lastMessage: 'Thanks for the tip about parking!',
    lastMessageTime: '1d ago',
    unreadCount: 0,
    isNewMatch: false,
  },
];

export const MOCK_MESSAGES: Record<string, MockMessage[]> = {
  '1': [
    {
      id: 'm1',
      senderId: 'user-1',
      text: 'Hey! I saw we matched for the Taylor Swift concert!',
      timestamp: '2:30 PM',
      isRead: true,
    },
    {
      id: 'm2',
      senderId: 'me',
      text: 'Yes! I\'m so excited. Have you been to Mercedes-Benz Stadium before?',
      timestamp: '2:32 PM',
      isRead: true,
    },
    {
      id: 'm3',
      senderId: 'user-1',
      text: 'No, this will be my first time! Any tips?',
      timestamp: '2:33 PM',
      isRead: true,
    },
    {
      id: 'm4',
      senderId: 'me',
      text: 'Definitely arrive early, the lines can get long. And the stadium has a clear bag policy.',
      timestamp: '2:35 PM',
      isRead: true,
    },
    {
      id: 'm5',
      senderId: 'user-1',
      text: 'Sounds great! See you there!',
      timestamp: '2:36 PM',
      isRead: true,
    },
  ],
  '2': [
    {
      id: 'm1',
      senderId: 'user-2',
      text: 'Hey! Are you still interested in going to the Laufey concert?',
      timestamp: '1:15 PM',
      isRead: false,
    },
    {
      id: 'm2',
      senderId: 'user-2',
      text: 'I have an extra ticket if you want to sit together!',
      timestamp: '1:16 PM',
      isRead: false,
    },
  ],
};
