import {
  requestAuthRegister, requestUserProfile, requestUsersAll, requestUserProfileSetName,
  requestUserProfileSetEmail, requestUserProfileSetHandle, requestClear,
  requestChannelsCreate, requestChannelJoin, requestChannelDetails, requestNotificationsGet,
  requestChannelInvite, requestDmCreate, requestMessageSendDm, requestMessageSend,
  requestMessageEdit, requestUserProfileUploadPhoto, requestMessageReact, requestMessageShare
} from './httpHelper';

describe('Test userProfile', () => {
  beforeEach(() => {
    requestClear();
  });

  test('token is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfile(user1.token + '1', user1.authUserId)).toEqual(403);
  });

  test('uId does not refer to a valid user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfile(user1.token, user1.authUserId + 1)).toEqual(400);
  });

  test('Returns user object for a valid user', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('Returns user object for multiple valid users', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUserProfile(user1.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'John',
        nameLast: 'Mate',
        email: 'johnmate@gmail.com',
        handleStr: 'johnmate',
        profileImgUrl: expect.any(String),
      },
    });
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
        profileImgUrl: expect.any(String),
      },
    });
  });
});

describe('Test userAll', () => {
  beforeEach(() => {
    requestClear();
  });

  test('session is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUsersAll(user1.token + '1')).toEqual(403);
  });

  test('return one user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });

  test('return array of users', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        },
        {
          uId: user2.authUserId,
          nameFirst: 'John',
          nameLast: 'Mate',
          email: 'johnmate@gmail.com',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});

// UserProfileSetName tests
describe('Test UserProfileSetName', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid first name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, '', 'Last')).toEqual(400);
    expect(requestUserProfileSetName(user1.token, 'nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'Last')).toEqual(400);
  });

  test('invalid last name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, 'First', '')).toEqual(400);
    expect(requestUserProfileSetName(user1.token, 'First', 'nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')).toEqual(400);
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token + 'z', 'Jesse', 'Pinkman')).toEqual(403);
  });

  test('successful name change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, 'Jesse', 'Pinkman')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Jesse',
          nameLast: 'Pinkman',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});

// UserProfileSetEmail tests
describe('Test userProfileSetEmail', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid email', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token, '.invalid@@..gmail.au.')).toEqual(400);
  });

  test('email in use by another user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('bcs@gmail.com', 'bcs123', 'Saul', 'Goodman');
    expect(requestUserProfileSetEmail(user1.token, 'bcs@gmail.com')).toEqual(400);
    expect(requestUserProfileSetEmail(user2.token, 'aliceP@fmail.au')).toEqual(400);
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token + 'w', 'validemail@gmail.com')).toEqual(403);
  });

  test('successful email change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token, 'new1@gmail.com')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'new1@gmail.com',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});

// userProfileSetHandle tests
describe('Test userProfileSetHandle', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid handle (too short/long)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'hi')).toEqual(400);
    expect(requestUserProfileSetHandle(user1.token, 'aliceeeeeeeeeeeeeeeeeeeeeeeee')).toEqual(400);
  });

  test('invalid handle (contains non-alphanumeric)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'alice!@!')).toEqual(400);
  });

  test('handle in use by another user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestUserProfileSetHandle(user1.token, 'newname');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm123', 'Michael', 'Scott');
    expect(requestUserProfileSetHandle(user2.token, 'newname')).toEqual(400);
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token + 's', 'kevin')).toEqual(403);
  });

  test('successful handle change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'dwight')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'dwight',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});

describe('Test Updating User Info', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Updating nothing', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
  });

  test('Updating name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    requestUserProfileSetName(user1.token, 'John', 'Smith');
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'John',
            nameLast: 'Smith',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
  });

  test('Updating email', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    requestUserProfileSetEmail(user2.token, 'scottywhite@gmail.com');
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'scottywhite@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
  });

  test('Updating handle', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    requestUserProfileSetHandle(user3.token, 'jimhalp');
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalp',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
  });
});

describe('Test notificationsGet', () => {
  beforeEach(() => {
    requestClear();
  });

  test('token is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestNotificationsGet(user1.token + '1')).toEqual(403);
  });

  test('Notification for channel invite', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [{
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'aliceperson added you to channel1',
      }],
    });
  });

  test('Notification for dm create', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [{
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'aliceperson added you to aliceperson, johnmate',
      }],
    });
  });

  test('Notification for dm create with multiple users', () => {
    requestClear();
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    expect(requestNotificationsGet(user3.token)).toStrictEqual({
      notifications: [{
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'johnnylawrence added you to aliceperson, johnnylawrence, johnnymate',
      }],
    });
  });

  test('Notification for tagged in dm', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, 'hello @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson tagged you in aliceperson, johnmate, johnnymate: hello @johnmate',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson added you to aliceperson, johnmate, johnnymate',
        }
      ],
    });
  });

  test('Notification for tagged in channel', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate how is it going today?');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate how ',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  test('Notification for non-member tagged in dm', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user3.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, 'hello @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [],
    });
  });

  test('Notification for non-member tagged in channel', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate how is it going today?');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [],
    });
  });

  test('Notification for multiple tags to same person in channel', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate how is it @johnmate going today?');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate how ',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  test('Notification for multiple tags to same person in dm', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, '@johnmate hello @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson tagged you in aliceperson, johnmate, johnnymate: @johnmate hello @joh',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson added you to aliceperson, johnmate, johnnymate',
        }
      ],
    });
  });

  test('Notification for tagged in edited message to channel', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate');
    requestMessageEdit(user1.token, message1.messageId, 'bye @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: bye @johnmate',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  test('Notification for message react in dm', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    const message1 = requestMessageSendDm(user2.token, dm1.dmId, 'hello');
    requestMessageReact(user1.token, message1.messageId, 1);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson reacted to your message in aliceperson, johnmate, johnnymate',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson added you to aliceperson, johnmate, johnnymate',
        }
      ],
    });
  });

  test('Notification for message react in channel', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    requestChannelInvite(user1.token, channel1.channelId, user3.authUserId);
    const message1 = requestMessageSend(user2.token, channel1.channelId, 'hello');
    requestMessageReact(user1.token, message1.messageId, 1);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson reacted to your message in channel1',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  test('Notification for shared message through channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user1.token, 'channel2', true);
    requestChannelInvite(user1.token, channel2.channelId, user2.authUserId);
    requestMessageShare(user1.token, message1.messageId, 'hi @aliceperson', channel2.channelId, -1);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel2.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel2: hi @aliceperson',
        },
        {
          channelId: channel2.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence added you to channel2',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence added you to channel1',
        }
      ],
    });
  });

  test('Notification for shared message through dm', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageShare(user1.token, message1.messageId, 'hi @aliceperson', -1, dm1.dmId);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnsmith tagged you in aliceperson, johnnymate, johnsmith: hi @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnsmith added you to channel1',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnsmith added you to aliceperson, johnnymate, johnsmith',
        }
      ],
    });
  });

  test('Over 20 Notifications', () => {
    requestClear();
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    const message1 = requestMessageSendDm(user1.token, dm1.dmId, '1 @aliceperson');
    const message2 = requestMessageSend(user1.token, channel1.channelId, '1 @aliceperson');
    const message3 = requestMessageSendDm(user1.token, dm1.dmId, '2 @aliceperson');
    const message4 = requestMessageSend(user1.token, channel1.channelId, '2 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '3 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '3 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '4 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '4 @aliceperson');
    requestMessageEdit(user1.token, message1.messageId, '5 @aliceperson');
    requestMessageEdit(user1.token, message2.messageId, '6 @aliceperson');
    requestMessageEdit(user1.token, message3.messageId, '7 @aliceperson');
    requestMessageEdit(user1.token, message4.messageId, '8 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '9 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '9 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '10 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '10 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '11 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '11 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '12 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '12 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '13 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '13 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '14 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '14 @aliceperson');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 14 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 14 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 13 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 13 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 12 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 12 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 11 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 11 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 10 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 10 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 9 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 9 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 8 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 7 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 6 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 5 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 4 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 4 @aliceperson',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'johnnylawrence tagged you in channel1: 3 @aliceperson',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'johnnylawrence tagged you in aliceperson, johnnylawrence, johnnymate: 3 @aliceperson',
        }
      ],
    });
  });
});

describe('Test userProfileUploadPhoto', () => {
  beforeEach(() => {
    requestClear();
  });

  test('token is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token + '1', URL, 0, 0, 200, 200)).toEqual(403);
  });

  test('url is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.testing.com/test.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 200, 200)).toEqual(400);
  });

  test('image is not jpg', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 200, 200)).toEqual(400);
  });

  test('invalid dimensions (not within original)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 900, 900)).toEqual(400);
  });

  test('invalid dimensions (not within original)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, -1, 0, 200, 200)).toEqual(400);
  });

  test('invalid dimensions (impossible x and y values)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 200, 0, 200, 200)).toEqual(400);
  });

  test('invalid dimensions (impossible x and y values)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 200, 200, 100)).toEqual(400);
  });

  test('Returns user object for multiple valid users', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 600, 340);
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
        profileImgUrl: expect.any(String),
      },
    });
  });
});
