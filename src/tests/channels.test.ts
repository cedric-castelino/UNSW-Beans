import {
  requestAuthRegister, requestClear, requestChannelsCreate, requestChannelsList,
  requestChannelsListAll, requestChannelDetails, requestChannelJoin
} from './httpHelper';

describe('Test channelsCreateV1', () => {
  beforeEach(() => {
    requestClear();
  });
  test('public channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'General', true);
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('private channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'General', false);
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('multiple channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'General', false);
    const channel2 = requestChannelsCreate(user1.token, 'Homework', true);
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });

    expect(requestChannelDetails(user1.token, channel2.channelId)).toStrictEqual({
      name: 'Homework',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('invalid user permissions', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestClear();
    const channel1 = requestChannelsCreate(user1.token, 'General', false);
    expect(channel1).toEqual(403);
  });

  test('channel name too short/long', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, '', true);
    const channel2 = requestChannelsCreate(user1.token, 'ABCDEFGHIJKLMNOPQRSTU', true);
    const channel3 = requestChannelsCreate(user1.token, 'ABCDEFGHIJKLMNOPQRST', true);
    expect(channel1).toEqual(400);
    expect(channel2).toEqual(400);
    expect(channel3).toStrictEqual({
      channelId: channel3.channelId,
    });
  });
});

// channelsListAllv1 testing
describe('Test channelsListAllv2 ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('one public channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const allDetails = requestChannelsListAll(user1.token);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general'
      }]
    });
  });

  test('one private channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'private', false);
    const allDetails = requestChannelsListAll(user1.token);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'private'
      }]
    });
  });

  test('three channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const channel2 = requestChannelsCreate(user1.token, 'private', false);
    const channel3 = requestChannelsCreate(user1.token, 'Lounge', true);
    const allDetails = requestChannelsListAll(user1.token);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general'
      }, {
        channelId: channel2.channelId,
        name: 'private'
      }, {
        channelId: channel3.channelId,
        name: 'Lounge'
      }]
    });
  });

  test('listing no channels', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const allDetails = requestChannelsListAll(user1.token);
    expect(allDetails).toStrictEqual({ channels: [] });
  });

  test('invalid token', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestChannelsCreate(user1.token, 'general', true);
    expect(requestChannelsListAll(user1.token + 'x')).toEqual(403);
  });
});

// requestChannelsList tests
describe('Test channelsListV2 ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('one joined public channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestChannelsCreate(user2.token, 'private', false);
    const user1Channel = requestChannelsList(user1.token);
    expect(user1Channel).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general',
      }]
    });
  });

  test('one joined private channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    requestChannelsCreate(user2.token, 'secret', false);
    const channel2 = requestChannelsCreate(user1.token, 'private', false);
    const user1Channel = requestChannelsList(user1.token);
    expect(user1Channel).toStrictEqual({
      channels: [{
        channelId: channel2.channelId,
        name: 'private',
      }]
    });
  });

  test('listing no channels', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    requestChannelsCreate(user2.token, 'lounge', true);
    const user1Channel = requestChannelsList(user1.token);
    expect(user1Channel).toStrictEqual({ channels: [] });
  });

  test('invalid user permissions', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestChannelJoin(user2.token, channel1.channelId);
    expect(requestChannelsList('example')).toEqual(403);
  });
});
