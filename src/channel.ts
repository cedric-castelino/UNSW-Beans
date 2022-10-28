import { getData, setData } from './dataStore';
import { Empty, Token, ChannelId, UId, Start, Error } from './interfaceTypes';
import { MessageList, ChannelDetails } from './internalTypes';

import {
  validUserId,
  validChannelId,
  userIsChannelMember,
  userIsChannelOwner,
  isGlobalOwner,
  getPublicUser,
  validToken,
  getUserIdFromToken,
  checkChannelOwner
} from './helper';

/**
  * Returns an object containing all messages sent from a certain start point in
  * a given channel, stopping at either 50 total messages or
  *
  * @param {UId} authUserId - The Id of the user attempting to see messages.
  * @param {ChannelId} channelId - The Id of the channel which messages are being returned.
  * @param {Start} start - The number of messages from the most recent to begin returning messages.
  *
  * @returns {MessageList} MessageList - Object containing start offset, end offset, and array of message objects.
  * @returns {Error} {error : 'Not valid channelId'} - If channelId was not found.
  * @returns {Error} {error : 'Invalid Session'} - If token does not correspond to an existing session.
  * @returns {Error} {error : 'Start is greater than total messages'} - If start offset is greater than total messages in channel.
  * @returns {Error} {error : 'Authorised user is not a channel member'} - authUserId is not in channel allMembers array.
*/
export function channelMessagesV2(token: Token, channelId: ChannelId, start: Start): MessageList | Error {
  if (!validChannelId(channelId)) return { error: 'Not valid channelId' };
  if (!validToken(token)) return { error: 'Invalid Session.' };

  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  if (start > data.channels[channelIndex].messages.length) return { error: 'Start is greater than total messages' };

  const authUId = getUserIdFromToken(token);
  if (!userIsChannelMember(authUId, channelId)) return { error: 'Authorised user is not a channel member' };

  let end = Math.min(data.channels[channelIndex].messages.length, start + 50);

  const messagesArray = [];
  for (let i = start; i < end; i++) messagesArray.push(data.channels[channelIndex].messages[i]);
  if (end === data.channels[channelIndex].messages.length) end = -1;
  messagesArray.sort((a, b) => b.timeSent - a.timeSent);

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}

/**
  * Removes the user from the channel member list.
  *
  * @param {Token} token - Token of user sending the invite.
  * @param {ChannelId} channelId - Id of channel user is being invited to.
  *
  * @returns {Error} {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {Error} {error: 'Invalid Token.'} - Token does not correspond to an existing user.
  * @returns {Error} {error: 'You are already a member.'} - authUserId corresponds to user already in channel.
  * @returns {Error} {error: 'You do not have access to this channel.'} - Channel is private.
  * @returns {Empty} {} - authUserId successfully leaves the specified channel.
  *
*/
export function channelLeaveV1(token: Token, channelId: ChannelId): Empty | Error {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };

  if (!validToken(token)) return { error: 'Invalid Token.' };
  const UserId = getUserIdFromToken(token);
  if (!userIsChannelMember(UserId, channelId)) return { error: 'You are not a member of this channel.' };
  const data = getData();

  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  const privateIndexAll = data.channels[channelIndex].allMembers.findIndex(channel => channel.uId === UserId);
  data.channels[channelIndex].allMembers.splice(privateIndexAll, 1);

  if (checkChannelOwner(UserId, channelId) === true) {
    const privateIndexOwner = data.channels[channelIndex].ownerMembers.findIndex(channel => channel.uId === UserId);
    data.channels[channelIndex].ownerMembers.splice(privateIndexOwner, 1);
  }

  setData(data);
  return {};
}

/**
  * Adds a user to the owner channel member list, giving them owner permissions.
  *
  * @param {Token} token - Token of user sending the invite.
  * @param {ChannelId} channelId - Id of channel user is being invited to.
  * @param {UId} uId - The User Id of the specified user
  *
  * @returns {Error} {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {Error} {error: 'Invalid User Id.'} - User Id does not exist.
  * @returns {Error} {error: 'User is not a member of this channel.'} - The user is not a member of the channel.
  * @returns {Error} {error: 'User is already an owner of this channel.'} - The user is already an owner of the channel.
  * @returns {Error} {error: 'Invalid Token.'} - Token does not correspond to an existing user.
  * @returns {Empty} {} - authUserId successfully grants another member owner permissions.
  *
*/
export function channelAddOwnerV1(token: Token, channelId: ChannelId, uId: UId): Empty | Error {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };
  if (!userIsChannelMember(uId, channelId)) return { error: 'User is not a Member of this channel.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };
  const data = getData();
  const authUId = getUserIdFromToken(token);
  if (userIsChannelOwner(uId, channelId)) return { error: 'User is already an Owner of this channel.' };
  const userHasPermissions = userIsChannelOwner(authUId, channelId) || isGlobalOwner(authUId);
  if (!userHasPermissions) return { error: 'You do not have the required permissions.' };

  const userIndex = data.users.findIndex(user => user.uId === uId);
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  const publicUser = getPublicUser(data.users[userIndex]);

  data.channels[channelIndex].ownerMembers.push(publicUser);

  setData(data);
  return {};
}

/**
  * Removes a user to the owner channel member list, revoking their owner permissions.
  *
  * @param {Token} token - Token of user sending the invite.
  * @param {ChannelId} channelId - Id of channel user is being invited to.
  * @param {UId} uId - The User Id of the specified user
  *
  * @returns {Error} {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {Error} {error: 'Invalid User Id.'} - User Id does not exist.
  * @returns {Error} {error: 'You are not a member of this channel.'} - The user is not a member of the channel.
  * @returns {Error} {error: 'Invalid Token.'} - Token does not correspond to an existing user.
  * @returns {Empty} {} - authUserId successfully grants another member owner permissions.
  *
*/
export function channelRemoveOwnerV1(token: Token, channelId: ChannelId, uId: UId): Empty | Error {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };
  if (!userIsChannelMember(uId, channelId)) return { error: 'User is not a member of this channel.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const data = getData();
  const authUId = getUserIdFromToken(token);
  if (!userIsChannelOwner(uId, channelId)) return { error: 'User is not an Owner of this channel.' };
  const userHasPermissions = userIsChannelOwner(authUId, channelId) || isGlobalOwner(authUId);
  if (!userHasPermissions) return { error: 'You do not have the required permissions.' };

  // Finds the index of the channel, and removes that index from the ownerMembers array.
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  const ownerIndex = data.channels[channelIndex].ownerMembers.findIndex(channel => channel.uId === uId);
  data.channels[channelIndex].ownerMembers.splice(ownerIndex, 1);

  setData(data);
  return {};
}

/**
  * Sends a user specific invite to a given channel
  *
  * @param {Token} token - Token of user sending the invite.
  * @param {ChannelId} channelId - Id of channel user is being invited to.
  * @param {UId} uId - Id of user to be invited.
  *
  * @returns {Error} {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {Error} {error: 'Invalid User Id.'}  - uId does not correspond to an existing user.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing session.
  * @returns {Error} {error: 'User is already a member.'} - uId corresponds to user already in channel.
  * @returns {Error} {error: 'Authorised User is not a member.'} - authUserId does not correspond to a user in channel allMembers array.
  * @returns {Empty} {} - uId has been succesfully invited to corresponding channel.
*/
export function channelInviteV2(token: Token, channelId: ChannelId, uId: UId): Empty | Error {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };
  if (userIsChannelMember(uId, channelId)) return { error: 'User is already a member.' };
  if (!userIsChannelMember(getUserIdFromToken(token), channelId)) return { error: 'Authorised User is not a member.' };
  const data = getData();

  const userIndex = data.users.findIndex(user => user.uId === uId);
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  data.channels[channelIndex].allMembers.push(getPublicUser(data.users[userIndex]));

  setData(data);
  return {};
}

/**
  * Provides the details of the owners and members of a given channel.
  *
  * @param {Token} token - Token of user sending the invite.
  * @param {ChannelId} channelId - Id of channel user is being invited to.
  *
  * @returns {Error} {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {Error} {error: 'Invalid Session.'} - token does not correspond to an existing session.
  * @returns {Error} {error: 'Authorised User is not a member.'} - authUserId does not correspond to a user in channel allMembers array.
  * @returns {ChannelDetails} ChannelDetails - Object containing channel successfully examined by authUserId.
*/
export function channelDetailsV2(token: Token, channelId: ChannelId): ChannelDetails | Error {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };
  if (!validToken(token)) return { error: 'Invalid Session Id.' };
  if (!userIsChannelMember(getUserIdFromToken(token), channelId)) return { error: 'Authorised User is not a member.' };

  const data = getData();

  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);

  setData(data);
  return {
    name: data.channels[channelIndex].name,
    isPublic: data.channels[channelIndex].isPublic,
    ownerMembers: data.channels[channelIndex].ownerMembers,
    allMembers: data.channels[channelIndex].allMembers,
  };
}

/**
  * Allows a user to attempt to join a channel.
  *
  * @param {Token} token - Token of user sending the invite.
  * @param {ChannelId} channelId - Id of channel user is being invited to.
  *
  * @returns {Error} {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {Error} {error: 'Invalid Token.'} - Token does not correspond to an existing user.
  * @returns {Error} {error: 'You are already a member.'} - authUserId corresponds to user already in channel.
  * @returns {Error} {error: 'You do not have access to this channel.'} - Channel is private.
  * @returns {Empty} {} - authUserId successfully joins the specified channel.
  *
*/
export function channelJoinV2(token: Token, channelId: ChannelId): Empty | Error {
  const data = getData();

  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };
  const uId = getUserIdFromToken(token);

  const channelIndex = data.channels.map(object => object.channelId).indexOf(channelId);
  const userIndex = data.users.findIndex(user => user.uId === getUserIdFromToken(token));
  const publicUser = getPublicUser(data.users[userIndex]);

  if (userIsChannelMember(uId, channelId)) return { error: 'You are already a member.' };
  const userHasAccess = data.channels[channelIndex].isPublic || isGlobalOwner(uId);
  if (!userHasAccess) return { error: 'You do not have access to this channel.' };

  data.channels[channelIndex].allMembers.push(publicUser);
  setData(data);

  return {};
}
