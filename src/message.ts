import { getData, setData } from './dataStore';
import { Error, Token, DmId, ChannelId, Message } from './interfaceTypes';
import { MessageIdObj } from './internalTypes';
import {
  validChannelId,
  validToken,
  getUserIdFromToken,
  validDmId,
  checkUserIdtoDm,
  checkUserIdtoChannel,
  generateMessageId,
} from './helper';

/**
 * Send and store a DM sent by a given user
 *
 * @param {Token} token - the session id of the sender
 * @param {DmId} dmId - the dm the message was sent in
 * @param {Message} message - the message to be sent
 * @returns {messageId} messageId - the Id of the stored message
 */
export function messageSendDmV1(token: Token, dmId: DmId, message: Message): MessageIdObj | Error {
  if (!validDmId(dmId)) return { error: 'Not valid Dm Id' };
  if (message.length < 1) return { error: 'Message contains too little characters.' };
  if (message.length > 1000) return { error: 'Message contains too many characters.' };
  if (!validToken(token)) return { error: 'Invalid Token' };
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the Dm' };

  const messageId = generateMessageId().messageId;
  const data = getData();
  // Add message to DM list
  data.dms.find(dm => dm.dmId === dmId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
  });

  setData(data);
  return {
    messageId: messageId,
  };
}

/**
 * Send and store a message within a channel sent by a given user
 *
 * @param {Token} token - the session id of the sender
 * @param {ChannelId} channelId - the dm the message was sent in
 * @param {Message} message - the message to be sent
 * @returns {messageId} messageId - the Id of the stored message
 */
export function messageSendV1(token: Token, channelId: ChannelId, message: Message): MessageIdObj | Error {
  if (!validChannelId(channelId)) return { error: 'Not valid channelId' };
  if (message.length < 1) return { error: 'Message contains too little characters.' };
  if (message.length > 1000) return { error: 'Message contains too many characters.' };
  if (!validToken(token)) return { error: 'Invalid Session.' };
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoChannel(authUserId, channelId)) return { error: 'Authorised user is not a channel member' };

  const messageId = generateMessageId().messageId;
  const data = getData();

  data.channels.find(channel => channel.channelId === channelId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
  });

  setData(data);
  return {
    messageId: messageId,
  };
}
