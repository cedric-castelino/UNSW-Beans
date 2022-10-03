import { authLoginV1, authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js'; 
import { channelDetailsV1 } from './channel.js'; 
import { clearV1 } from './other.js';

// channelsCreateV1 tests

describe('Test channelsCreateV1 ', () => {
  beforeEach(() => {
    clearV1();
  });
  test('simple channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'General', true);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: "General",
      isPublic: true,
      ownerMembers: [user1.authUserId],
      allMembers: [user1.authUserId],
    });
  });
});

