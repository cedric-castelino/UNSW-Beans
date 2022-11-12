
import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestStandupStart,
  requestStandupActive,
  requestStandupSend
} from './httpHelper';

describe('standupSendV1 tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('error: invalid token', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupStart(user.token + 'x', channel.channelId, 1)).toEqual(403);
  });
  test('error: invalid channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupStart(user.token, channel.channelId + 69, 1)).toEqual(400);
  });
  test('error: negative length', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupStart(user.token, channel.channelId, -3)).toEqual(400);
  });
  test('error: active standup currently running in channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    requestStandupStart(user.token, channel.channelId, 1);
    expect(requestStandupStart(user.token, channel.channelId, 1)).toEqual(400);
  });

  test('error: channelId is valid but authorised user is not a member of the channel', () => {
    const user1 = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const user2 = requestAuthRegister('creed@gmail.com', 'creed123', 'Creed', 'Bratton');
    const channel = requestChannelsCreate(user1.token, 'Example', true);
    expect(requestStandupStart(user2.token, channel.channelId, 1)).toEqual(403);
  });

  test('successful start', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupStart(user.token, channel.channelId, 0.1)).toStrictEqual({ timeFinish: expect.any(Number) }); // possibly change
  });
});

describe('standupActiveV1 tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('error: invalid token', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupActive(user.token + 'x', channel.channelId)).toEqual(403);
  });

  test('error: invalid channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupActive(user.token, channel.channelId + 69)).toEqual(400);
  });
  test('error: channelId is valid but authorised user is not a member of the channel', () => {
    const user1 = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const user2 = requestAuthRegister('creed@gmail.com', 'creed123', 'Creed', 'Bratton');
    const channel = requestChannelsCreate(user1.token, 'Example', true);
    expect(requestStandupActive(user2.token, channel.channelId)).toEqual(403);
  });
}); // temp
/*
  test('success: no standup is active', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupActive(user.token, channel.channelId)).toStrictEqual({ isActive: false, timeFinish: null });
  });
  test('success: standup is active', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    const timeNow = (Math.floor((new Date()).getTime() / 1000));
    requestStandupStart(user.token, channel.channelId, 0.1);
    expect(requestStandupActive(user.token, channel.channelId)).toStrictEqual({ isActive: false, timeFinish: timeNow + 0.1 });
  });
});
*/
describe('standupSendV1 tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('error: invalid token', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupSend(user.token + 'x', channel.channelId, 'hello')).toEqual(403);
  });
  test('error: invalid channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupSend(user.token, channel.channelId + 69, 'hello')).toEqual(400);
  });
  test('error: message is over 1000 characters', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    requestStandupStart(user.token, channel.channelId, 0.1);
    expect(requestStandupSend(user.token, channel.channelId, 'ernncggcenccinrnneiiergenrgincgnceegcrgegeicecccrneerecericgnigreincnncrrieicnecgnnergrginnrgciinreggcerrcnciccccrriigegigniniecgigiccgeegiiegicggergnenegeeigcgcrggigrnniiienccgrccgicriireeicerniecenicgrrinrcigneierneegncrrccggricerciecgeirgicrgnnirgcnegiecgeggreciegcrieiigrcgecrergngiirrcncneereinncrcerrcnerrgrcngegrgrrcrccieigeeceggerineiingreerginieircrirrrgrercgircnriggrinrrngeienccgieicnreccreningcnrerceiigeineenrrrerirrinininririecirrecigiiginrngiirrcrgcigggcrginiiigcngrrncinnrcrrcngrgninrrrncecngiriiccegirinnnggcnnceenigergceeengicncgggrgeccncireineenniciinengeigcegnigenrnncneececgngcggnrrieicrnnnrninenrrrececiecirnergrcigcreeennereeggggiicirerecgenenieeeciccrnneegcgnngcccgnrncecrgneggregrgencineiccngnineicgnnircigrrnggggrriiirreegreencgcceeigcgrgecnngineiiicrreernecngggeiireengreicciigircgincncceregniiecggreignncrgcrccginennggicncinccregierciinrcgicrrrcgnicgicinngiegrcnninrencrrreegggnerngeigrrceggreriecicrgeererinencingcgiengieggeigegenngiggrngerccgieccccigeggreccnigircrininrrreeei')).toEqual(400);
  });
  test('error: an active standup is not currently running in the channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupSend(user.token, channel.channelId, 'hello')).toEqual(400);
  });
  test('error: channelId is valid and the authorised user is not a member of the channel', () => {
    const user1 = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const user2 = requestAuthRegister('creed@gmail.com', 'creed123', 'Creed', 'Bratton');
    const channel = requestChannelsCreate(user1.token, 'Example', true);
    requestStandupStart(user1.token, channel.channelId, 0.1);
    expect(requestStandupSend(user2.token, channel.channelId, 'fail')).toEqual(403);
  });
}); // temp
/*
  test('success', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    requestStandupStart(user.token, channel.channelId, 0.1);
    expect(requestStandupSend(user.token, channel.channelId, 'yay')).toStrictEqual({});
  });
});
*/
