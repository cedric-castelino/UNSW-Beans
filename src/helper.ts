import { getData, setData } from './dataStore';
import {
  Empty, Error,
  UId, Token,
  ChannelId, DmId, MessageId,
  User, HandleStr, Name,
  Password, tagInfo, UserStats
} from './interfaceTypes';
import { PrivateUser, Session, PrivateChannel, HashedPassword } from './internalTypes';

/**
 * Checks whether a uId exists in the database
 *
 * @param {UId} uId - Id of user.
 * @returns {boolean} boolean of whether user is valid
 */
export function validUserId(uId: UId): boolean {
  const data = getData();
  return data.users.some(user => user.uId === uId);
}

/**
 * Gets the value of a uId (not an object) from a given token.
 * @param {Token} token - token to get authUserId from
 * @returns {UId} uId - not an object.
 */
export function getUserIdFromToken(token: Token): UId {
  const data = getData();
  const hashedToken = hashCode(token + 'secret');
  return data.sessions.find(s => s.token === hashedToken).authUserId;
}

/**
 * Checks whether a token is valid (whether it exists in the sessions)
 *
 * @param {Token} token - Token to check
 * @returns {boolean} Boolean of whether the session is valid
 */
export function validToken(token: Token): boolean {
  const data = getData();
  const hashedToken = hashCode(token + 'secret');
  if (data.sessions.some(t => t.token === hashedToken)) {
    return true;
  } else return false;
}

/**
 * Checks whether a password is valid
 *
 * @param {Password} password - password to check
 * @returns {boolean} Boolean of whether the password is valid
 */
export function validPassword(storedPassword: HashedPassword, attemptedPassword: Password): boolean {
  const hashedAttempt = hashCode(attemptedPassword + 'secret');
  if (storedPassword === hashedAttempt) {
    return true;
  } else return false;
}

/**
 *
 * @param {Token} token - unhashed token to be hashed with global secret
 * @returns {number} token hashed with global secret.
 */
/* export function encodeToken(token: Token): number {
  return hashCode(token + 'secret');
} */

/**
 * Checks whether a channel is valid (whether it exists in the database)
 *
 * @param {ChannelId} channelId - Id of channel.
 * @returns {boolean} boolean - whether channel is valid
 */
export function validChannelId(channelId : ChannelId) : boolean {
  const data = getData();
  return data.channels.some(channel => channel.channelId === channelId);
}

/**
 * Checks whether a user is in a channel
 *
 * @param {UId} uId - the user to check
 * @param {ChannelId} channelId - the channel the user may be contained in
 * @returns {boolean} boolean - true if user is in the channel
 */
export function userIsChannelMember(uId: UId, channelId : ChannelId) : boolean {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  return channel.allMembers.some(user => user.uId === uId);
}

/**
 * Checks whether a user owns a channel.
 * Does not account for global permissions.
 *
 * @param {UId} uId - the user to check
 * @param {ChannelId} channelId - the channel the user may be contained in
 * @returns {boolean} boolean - true if the user owns the channel
 */
export function userIsChannelOwner(uId: UId, channelId : ChannelId) : boolean {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  return channel.ownerMembers.some(user => user.uId === uId);
}

/**
 * Converts Private User to Public User
 *
 * @param {PrivateUser} user - to remove password from
 * @returns {User} User type - a user as in interface
 */
export function getPublicUser(user: PrivateUser): User {
  return {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
    profileImgUrl: user.profileImgUrl,
  };
}

/**
 * Creates a session token for a user.
 *
 * @param {UId} uId - the user to assign the token to
 * @returns {Session} {token : string, authUserId: number} - the session object that was created.
 */
export function generateSession(uId: UId): Session {
  const tokenLength = 32;
  const token = genRandomString(tokenLength);
  const storedSession = {
    token: hashCode(token + 'secret'),
    authUserId: uId,
  };

  const data = getData();

  data.sessions.push(storedSession);
  setData(data);

  const returnedSession = {
    token: token,
    authUserId: uId,
  };

  return returnedSession;
}

/**
 *
 * @param {string} str - the string to be hashed
 * @returns {string} - the hashed version of the string
 */
export function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let x = 0; x < str.length; x++) {
    const ch = str.charCodeAt(x);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Creates a messageId.
 * Updates data. (You may need to call getData() again.)
 *
 * @returns {messageId : MessageId} {messageId : number} - the session object that was created.
 */
export function generateMessageId(): {messageId : MessageId} {
  const data = getData();
  const messageId = data.nextMessage;
  data.nextMessage++;
  setData(data);
  return {
    messageId: messageId,
  };
}

/**
 * Creates a new uId.
 * Updates data. (You may need to call getData() again.)
 *
 * @returns {uId : UId} {uId : UId} - the new uId that was created.
 */
export function generateUId(): {uId: UId} {
  const data = getData();
  const uId = data.nextUId;
  data.nextUId++;
  setData(data);
  return {
    uId: uId,
  };
}

/**
 * Returns whether or not a user is a global owner, given a uid
 * @param {UId} uId - the user to check
 * @return {boolean} boolean of whether user is global owner or not
 * @return {Error} {error: 'Invalid User'} if user does not exist
 */
export function isGlobalOwner(uId: UId): boolean | Error {
  if (!validUserId(uId)) return { error: 'Invalid User' };
  const data = getData();
  return data.users.find((user) => user.uId === uId).globalPermissions === 1;
}

/**
 * Constructs a userStats obj for a user to track join/send history.
 * @returns {UserStats} use stats, with all joins/sends set to 0.
 */
export function userStatsConstructor(): UserStats {
  const time = Date.now();
  return {
    channelsJoined:
      [
        {
          numChannelsJoined: 0,
          timeStamp: time
        }
      ],
    dmsJoined:
      [
        {
          numDmsJoined: 0,
          timeStamp: time
        }
      ],
    messagesSent:
      [
        {
          numMessagesSent: 0,
          timeStamp: time
        }
      ],
    involvementRate: 0
  };
}

/**
 * Given a userId and the required changes in involvement, calculate an updated involvement.
 * THIS EXPECTS THE DATA TO NOT HAVE BEEN SAVED YET! This is important for certain user/workspace functionality.
 * NOTE this also is capped at 1 (which occurs when a message is sent, then deleted, which does not change MessagesSent but does
 * change MessagesExist, therefore increasing Involvement).
 * @param {UId} uId - the user to update
 * @param {number} totalchange - the workspace change
 * @param {number} userchange - the user change (difference being if a user leaves a channel, but that channel is not deleted)
 * @returns {number} a float between 0 and 1 (inclusive) correlated to involvement.
 */
export function calculateInvolvementRate(uId: UId, totalchange: number, userchange: number): number {
  const data = getData();
  const stats = data.users.find(user => user.uId === uId).userStats;
  const totalItems = data.workspaceStats.numChannels + data.workspaceStats.numDms + data.workspaceStats.numMessages + totalchange;

  // add up user current channels, dms, messages sent, adding on change
  const userItems = userchange +
    stats.channelsJoined[stats.channelsJoined.length - 1].numChannelsJoined +
    stats.dmsJoined[stats.dmsJoined.length - 1].numDmsJoined +
    stats.messagesSent[stats.messagesSent.length - 1].numMessagesSent;
  if (totalItems === 0) return 0;
  // Clamp to 1 in case a message is deleted (which does not affect userSent but does affect messageTotal)
  return Math.min(userItems / totalItems, 1);
}

/**
 * Given a userId and the required changes in involvement, calculate an updated involvement.
 * THIS EXPECTS THE DATA TO NOT HAVE BEEN SAVED YET! This is important for certain user/workspace functionality.
 * NOTE this also is capped at 1 (which occurs when a message is sent, then deleted, which does not change MessagesSent but does
 * change MessagesExist, therefore increasing Involvement).
 * @returns {number} a float between 0 and 1 (inclusive) correlated to involvement.
 */
export function calculateUtilizationRate(): number {
  const data = getData();

  // add up user current channels, dms, messages sent, adding on change
  let usersInAtLeastOneChat = 0;
  for (const user of data.users) {
    const userIsInChannel = data.channels.some(channel => userIsChannelMember(user.uId, channel.channelId));
    const userIsInDm = data.dms.some(dm => checkUserIdtoDm(user.uId, dm.dmId));
    if (userIsInChannel || userIsInDm) {
      usersInAtLeastOneChat++;
    }
  }
  if (data.workspaceStats.numUsers === 0) return 0;
  // Clamp to 1
  return Math.min(usersInAtLeastOneChat / data.workspaceStats.numUsers, 1);
}

/**
 * Generates a random string.
 * From https://tecadmin.net/generate-random-string-in-javascript/
 * @param {integer} length - how long of a string to generate.
 * @returns {string} string - random string
 */
function genRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  const charLength = chars.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }

  return result;
}

/**
 * Gets the handle string of a user from a given user id.
 * @param {UId} uId - id of the the required user.
 * @returns {HandleStr} handleStr - users handle string.
 */
export function gethandleStrFromId(uId: UId): HandleStr {
  const data = getData();
  return data.users.find(s => s.uId === uId).handleStr;
}

/**
 * Checks whether a dm id is valid (whether it exists in the database)
 *
 * @param {DmId} dmId - Id of dm
 * @returns {boolean} boolean - whether dm id is valid
 */
export function validDmId(dmId: DmId): boolean {
  const data = getData();
  return data.dms.some(dm => dm.dmId === dmId);
}

/**
 * Checks whether a user is in a dm
 *
 * @param {UId} uId - the user to check
 * @param {DmId} dmId - the dm the user may be contained in
 * @returns {boolean} boolean - whether the user is in the dm
 */
export function checkUserIdtoDm(uId: UId, dmId: DmId): boolean {
  const data = getData();
  const position = data.dms.findIndex(dm => dm.dmId === dmId);
  return data.dms[position].members.some(user => user.uId === uId);
}

/**
 * Update users' information in all channels. ie. if a name changes, then update
 * that name in all channels
 *
 * @param {UId} uId - the users details to update.
 * @returns {Empty} {} - if successful
 * @returns {Error} {error: "uId invalid"} if user does not exist.
 */
export function updateUserDetails(uId: UId) : Empty | Error {
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };
  const data = getData();

  // Get updated user details
  const updatedUser = getPublicUser(data.users.find(user => user.uId === uId));

  // Update user details in each channel
  for (const channel of data.channels) {
    if (userIsChannelMember(uId, channel.channelId)) {
      const ownerIndex = channel.ownerMembers.findIndex((user) => user.uId === uId);
      channel.ownerMembers[ownerIndex] = updatedUser;
      const memberIndex = channel.allMembers.findIndex((user) => user.uId === uId);
      channel.allMembers[memberIndex] = updatedUser;
    }
  }

  // Update user details in each DM
  for (const dm of data.dms) {
    if (checkUserIdtoDm(uId, dm.dmId)) {
      if (dm.owner.uId === uId) dm.owner = updatedUser;
      const memberIndex = dm.members.findIndex((user) => user.uId === uId);
      dm.members[memberIndex] = updatedUser;
    }
  }

  setData(data);
  return {};
}

/** Generates a unique handle for a user
 *
 * @param {Name} nameFirst - first name of the user
 * @param {Name} nameLast - last name of the user
 *
 * @returns {HandleStr} handleStr - generated handle for user
 */
export function generateHandleStr(nameFirst: Name, nameLast: Name): HandleStr {
  let handleStr = nameFirst + nameLast;
  handleStr = handleStr.toLowerCase();
  handleStr = handleStr.replace(/[^a-z0-9]/gi, '');
  if (handleStr.length > 20) {
    handleStr = handleStr.substring(0, 20);
  }
  let num = 0;
  let handleStringExists = false;
  const data = getData();
  for (const user of data.users) {
    if (handleStr === user.handleStr) {
      num = 0;
      handleStringExists = true;
    } else if ((handleStr === user.handleStr.substring(0, handleStr.length)) && /^\d$/.test(user.handleStr[user.handleStr.length - 1])) {
      num++;
    }
  }
  if (handleStringExists) {
    handleStr += num;
  }

  return handleStr;
}

/**
 * Checks if a message is in a channel
 *
 * @param messageId - the id of the message to be checked
 * @returns number - returns the index of the channel if present or -1 if not
 */
export function checkMessageToChannel(messageId : number) : number {
  const data = getData();
  for (let channel = 0; channel < data.channels.length; channel++) {
    for (const message of data.channels[channel].messages) {
      if (message.messageId === messageId) {
        return channel;
      }
    }
  }
  return -1;
}

/**
 * Checks if a message is in a dm
 *
 * @param messageId - the id of the message to be checked
 * @returns number - returns the index of the dm if present or -1 if not
 */
export function checkMessageToDm(messageId : number) : number {
  const data = getData();
  for (let dm = 0; dm < data.dms.length; dm++) {
    for (const message of data.dms[dm].messages) {
      if (message.messageId === messageId) {
        return dm;
      }
    }
  }
  return -1;
}

/**
 * Checks whether a user has permission to affect a message
 *
 * @param authUserId - the user to check
 * @param messageId - the id of the message to be checked
 * @returns boolean - whether the user has access to change the message
 */
export function checkUserToMessage(authUserId : number, messageId : number) : boolean {
  const data = getData();
  const checkChannel = checkMessageToChannel(messageId);
  if (checkChannel === -1) {
    const checkDm = checkMessageToDm(messageId);
    if (checkDm === -1) {
      return false;
    } else {
      const dmPosition = data.dms[checkDm].messages.findIndex(message => message.messageId === messageId);
      if (data.dms[checkDm].messages[dmPosition].uId === authUserId) {
        return true;
      } else {
        if (data.dms[checkDm].owner.uId === authUserId) {
          return true;
        } else {
          return false;
        }
      }
    }
  } else {
    const position = data.channels[checkChannel].messages.findIndex(message => message.messageId === messageId);
    if (data.channels[checkChannel].messages[position].uId === authUserId) {
      return true;
    } else {
      for (const member of data.channels[checkChannel].ownerMembers) {
        if (member.uId === authUserId) {
          return true;
        }
      }
      return false;
    }
  }
}

/**
 * Checks whether a message id is valid
 *
 * @param messageId - the id of the message to be checked
 * @returns boolean - whether the message id is valid or not
 */
export function validMessageId(messageId : number) : boolean {
  if (checkMessageToChannel(messageId) === -1 && checkMessageToDm(messageId) === -1) {
    return false;
  } else {
    return true;
  }
}

/**
 * Checks whether a member has owner permsissions within a channel
 *
 * @param authUserId - the user to check
 * @param channelId - the channel to be checked
 *
 * @returns boolean - whether the user has owner permissions or not
 */
export function checkChannelOwner(authUserId: number, channelId: number): boolean {
  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  for (let i = 0; i < data.channels[channelIndex].ownerMembers.length; i++) {
    if (authUserId === data.channels[channelIndex].ownerMembers[i].uId) {
      return true;
    }
  }
  return false;
}

export function getUserFromEmail(email: string): User {
  const data = getData();
  const userObject = data.users.find((userEmail) => userEmail.email === email);
  return userObject;
}

/**
 * Checks a message for any users tagged
 *
 * @param message - the message to check
 *
 * @returns tagInfo - object containing number of tags and users tagged
 */
export function checkTag(message: string, channelId: number, dmId: number): tagInfo {
  function checkAlreadyTagged(uId: UId, taggedUsers: UId[]): boolean {
    return taggedUsers.includes(uId);
  }
  const data = getData();
  let channelIndex = 0;
  let dmIndex = 0;
  let isDm = false;
  if (channelId === -1) {
    dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
    isDm = true;
  } else {
    channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  }
  let newMessage = message;
  const usersTagged: string[] = [];
  let tagCount = 0;

  for (let i = 0; i < message.length; i++) {
    if (message[i] === '@') {
      tagCount += 1;
    }
  }
  if (tagCount === 0) {
    return {
      amountTagged: 0,
      membersTagged: [],
    };
  } else {
    let verifiedTagCount = 0;
    const verifiedTaggedUsers = [];
    for (let i = 0; i < tagCount; i++) {
      newMessage = newMessage.substring(newMessage.indexOf('@') + 1);
      const filterTag = newMessage.split(' ');
      usersTagged.push(filterTag[0]);
    }
    for (let i = 0; i < usersTagged.length; i++) {
      if (data.users.some(user => user.handleStr === usersTagged[i])) {
        const userIndex = data.users.findIndex(user => user.handleStr === usersTagged[i]);
        if (isDm) {
          if (checkUserIdtoDm(data.users[userIndex].uId, data.dms[dmIndex].dmId) && !checkAlreadyTagged(data.users[userIndex].uId, verifiedTaggedUsers)) {
            verifiedTagCount += 1;
            verifiedTaggedUsers.push(data.users[userIndex].uId);
          }
        } else {
          if (userIsChannelMember(data.users[userIndex].uId, data.channels[channelIndex].channelId) && !checkAlreadyTagged(data.users[userIndex].uId, verifiedTaggedUsers)) {
            verifiedTagCount += 1;
            verifiedTaggedUsers.push(data.users[userIndex].uId);
          }
        }
      }
    }
    return {
      amountTagged: verifiedTagCount,
      membersTagged: verifiedTaggedUsers,
    };
  }
}

/**
 * Checks if resetCode exists in data
 *
 * @param {string} resetCode - a resetCode emailed to the user
 * @returns {boolean} - true/false whether resetCode is valid/exists
 */
export function validResetCode(resetCode: string): boolean {
  return getData().users.some(user => user.resetCode === resetCode);
}

export function getChannelFromChannelId(channelId: ChannelId): PrivateChannel {
  const data = getData();
  const channel = data.channels.find(x => x.channelId === channelId);
  return channel;
}

/**
 * Ends standup.
 *
 * @param token - token of user who started standup
 * @param channelId - id of channel that standup is active in
 *
 * @returns {Empty} - upon successful ending of standup
 */
export function endStandup(token: Token, channelId: ChannelId): Empty {
  const data = getData();
  const standupChannelIndex = data.channels.findIndex(c => c.channelId === channelId);
  if (!data.channels[standupChannelIndex]) return {};
  const standupMessage = data.channels[standupChannelIndex].standupMessage.replace(/\n$/, ''); // removes last newline
  // basically messageSendV2(token, channelId, message) WITHOUT NOTIFICATIONS
  const standupMessageId = generateMessageId().messageId;
  if (data.channels[standupChannelIndex].standupMessage !== '') {
    data.channels.find(c => c.channelId === channelId).messages.push({
      messageId: standupMessageId,
      uId: getUserIdFromToken(token),
      message: standupMessage,
      timeSent: Date.now(),
      reacts: [],
      isPinned: false,
    });
  }
  data.channels[standupChannelIndex].activeStandup = false;
  data.channels[standupChannelIndex].standupTimeFinish = null;
  data.channels[standupChannelIndex].standupMessage = '';
  setData(data);
  return {};
}
