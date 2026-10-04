/* eslint-env jest */
// jest.setup.js
// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => {}, { virtual: true });
jest.mock('react-native-url-polyfill', () => ({ setupURLPolyfill: () => {} }), { virtual: true });

// Mock react-native-tts & haptics
jest.mock('react-native-tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setDefaultRate: jest.fn(),
  setDefaultPitch: jest.fn(),
}), { virtual: true });

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}), { virtual: true });

// Mock @react-native-async-storage/async-storage
const mockAsyncStorageMap = new Map();
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key, value) => {
    mockAsyncStorageMap.set(key, value);
    return Promise.resolve();
  }),
  getItem: jest.fn((key) => {
    return Promise.resolve(mockAsyncStorageMap.get(key) || null);
  }),
  removeItem: jest.fn((key) => {
    mockAsyncStorageMap.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockAsyncStorageMap.clear();
    return Promise.resolve();
  }),
}));

// Mock Supabase client for testing
jest.mock('./src/lib/supabase', () => {
  const mockListeners = {};

  const createMockChannel = (channelName) => ({
    name: channelName,
    on: jest.fn(function(type, filter, callback) {
      const event = filter.event || type;
      if (!mockListeners[event]) mockListeners[event] = [];
      mockListeners[event].push(callback);
      return this;
    }),
    subscribe: jest.fn(function(callback) {
      if (callback) callback('SUBSCRIBED');
      return this;
    }),
    send: jest.fn(function(msg) {
      const event = msg.event;
      if (mockListeners[event]) {
        mockListeners[event].forEach((cb) => cb({ payload: msg.payload }));
      }
      return Promise.resolve();
    }),
  });

  const createQueryBuilder = () => {
    const builder = {
      select: jest.fn(() => builder),
      insert: jest.fn(() => builder),
      update: jest.fn(() => builder),
      upsert: jest.fn(() => builder),
      delete: jest.fn(() => builder),
      eq: jest.fn(() => builder),
      order: jest.fn(() => builder),
      limit: jest.fn(() => builder),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: (resolve) => resolve({ data: null, error: null }),
    };
    return builder;
  };

  return {
    supabase: {
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
        signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signInAnonymously: jest.fn(() => Promise.resolve({ data: { user: { id: 'guest-1' } }, error: null })),
      },
      from: jest.fn(() => createQueryBuilder()),
      channel: jest.fn((name) => createMockChannel(name)),
      removeChannel: jest.fn(),
    },
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const mockComponent = (name) => {
    const Component = (props) => React.createElement(name, props, props?.children);
    Component.displayName = name;
    return Component;
  };

  const handler = {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      if (prop === 'default') return mockComponent('Svg');
      if (typeof prop === 'string') {
        return mockComponent(prop);
      }
      return undefined;
    },
  };

  return new Proxy({}, handler);
}, { virtual: true });
