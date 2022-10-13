import { clearV1 } from './../other';
import { authRegisterV1, authLoginV1 } from './../auth';

describe('Test clearV1 ', () => {
  beforeEach(() => {
    clearV1();
  });

  test('authLogin error, user data cleared', () => {
    authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    authRegisterV1('jamieS@later.co', '&##@P', 'Jamie', 'Son');
    clearV1();
    expect(authLoginV1('johnS@email.com', 'passJohn')).toStrictEqual({ error: 'Email Not Found.' });
    expect(authLoginV1('aliceP@fmail.au', 'alice123')).toStrictEqual({ error: 'Email Not Found.' });
    expect(authLoginV1('jamieS@later.co', '&##@P')).toStrictEqual({ error: 'Email Not Found.' });
  });

  /* test('channelListAll error, channel data cleared', () => {
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    const channel2 = channelsCreateV1(user2, 'channel2', false);
    const channel3 = channelsCreateV1(user2, 'channel3', true);
    const channel4 = channelsCreateV1(user3, 'channel%$#', true);
    clearV1();
    expect(channelsListAllV1(user1)).toStrictEqual('uId not found.');
    expect(channelsListAllV1(user2)).toStrictEqual('uId not found.');
    expect(channelsListAllV1(user3)).toStrictEqual('uId not found.');
  });

  test('channelMessages error, message data cleared',() => {
    const channel3 = channelsCreateV1(user3, 'channel3', true);
    channelJoinV1(user1, channel3);
    channelJoinV1(user2, channel3);
    clearV1();
    expect(channelMessagesV1(user1, channel3, 0).toStrictEqual('uId not found.'));
    expect(channelMessagesV1(user2, channel3, 0).toStrictEqual('uId not found.'));
    expect(channelMessagesV1(user3, channel3, 0).toStrictEqual('uId not found.'));
  }); */
});