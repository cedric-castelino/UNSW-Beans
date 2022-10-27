import { getData, setData } from './dataStore';
import { Empty, Error, DmId, Start, Token, UIds } from './interfaceTypes';
import { DmDetails, MessageList, DMsObj, PrivateDm } from './internalTypes';
import {
  validUserId,
  validToken,
  getUserIdFromToken,
  gethandleStrFromId,
  validDmId,
  checkUserIdtoDm,
  getPublicUser
} from './helper';

/**
  * Creates and stores a new DM.
  *
  * @param {Token} token - Token of user creating the dm.
  * @param {UIds} uIds - Array of user ids, reffering to users added to the dm.
  *
  * @returns {Error} {error: 'Invalid User Id.'}  - any uId in arrray does not correspond to an existing user.
  * @returns {Error} {error: 'Duplicate User Id found.'} - duplicate user id found in uIds array.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {{dmId: DmId}} {dmId: number} - if creation is successfull.
*/
export function dmCreateV1(token: Token, uIds: UIds): {dmId: DmId} | Error {
  if (!validToken(token)) return { error: 'Invalid Token.' };
  for (const i of uIds) {
    if (!validUserId(i)) return { error: 'Invalid User Id given.' };
  }
  if (uIds.length !== Array.from(new Set(uIds)).length) return { error: 'Duplicate User Id found.' };

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  const names = [];
  const members = [];

  names.push(gethandleStrFromId(authUserId));
  members.push(getPublicUser(data.users.find(user => user.uId === authUserId)));
  if (uIds.length !== 0) {
    for (const uId of uIds) {
      members.push(getPublicUser(data.users.find(user => user.uId === uId)));
      names.push(gethandleStrFromId(uId));
    }
  }

  names.sort(function(a, b) {
    return a.localeCompare(b);
  });

  const name = names.join(', ');
  let newdmId = 0;
  while (data.dms.some(c => c.dmId === newdmId)) newdmId++;
  const ownerIndex = data.users.findIndex(user => user.uId === authUserId);
  const newDm: PrivateDm = {
    dmId: newdmId,
    name: name,
    members: members,
    owner: getPublicUser(data.users[ownerIndex]),
    messages: []
  };

  data.dms.push(newDm);
  setData(data);

  return { dmId: newDm.dmId };
}

/**
  * Lists all DMs that the user is a member of.
  *
  * @param {Token} token - Token of user checking each dm.
  *
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {DMsObj} dms - array of objects containing information about each dm.
*/
export function dmListV1(token: Token): DMsObj | Error {
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const data = getData();
  const dmList = [];
  const authUserId = getUserIdFromToken(token);
  for (const i of data.dms) {
    if (checkUserIdtoDm(authUserId, i.dmId)) {
      dmList.push({
        dmId: i.dmId,
        name: i.name
      });
    }
  }

  return { dms: dmList };
}

/**
  * Removes the user from a chosen DM.
  *
  * @param {Token} token - Token of user leaving the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to leave.
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {Empty} {} - DM has been succesfully left.
*/
export function dmLeaveV1(token: Token, dmId: DmId): Empty | Error {
  if (!validDmId(dmId)) return { error: 'Invalid DM Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the DM.' };

  const data = getData();
  const position = data.dms.findIndex(dm => dm.dmId === dmId);
  const dmIndex = data.dms[position].members.findIndex(user => user.uId === authUserId);
  data.dms[position].members.splice(dmIndex, 1);

  setData(data);

  return {};
}

/**
  * Deletes a DM entirely.
  *
  * @param {Token} token - Token of user deleting the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to delete.
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {Empty} {} - DM has been succesfully left.
*/
export function dmRemoveV1(token: Token, dmId: DmId): Empty | Error {
  if (!validDmId(dmId)) return { error: 'Invalid DM Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the DM.' };

  const data = getData();
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  if (authUserId !== data.dms[dmIndex].owner.uId) return { error: 'Authorised user is not creator of DM' };

  data.dms.splice(dmIndex, 1);
  setData(data);

  return {};
}

/**
  * Given a DM, returns its name and members.
  *
  * @param {Token} token - Token of user deleting the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to delete.
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {DmDetails} DmDetails if Dm exists and user is a valid candidate to view its details.
*/
export function dmDetailsV1(token: Token, dmId: DmId): DmDetails | Error {
  if (!validDmId(dmId)) return { error: 'Invalid DM Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the DM.' };

  const data = getData();
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  const dmInfo = {
    name: data.dms[dmIndex].name,
    members: data.dms[dmIndex].members
  };

  return dmInfo;
}

/**
  * Views 50 or less messages in a given Dm
  *
  * @param {Token} token - Token of user deleting the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to delete.
  * @param {Start} start - offset of messages from the most recent to begin displaying from
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {Error} {error: 'Start is greater than total messages'} - start offset is higher than total messages.
  * @returns {MessageList} DM messages if valid.
*/
export function dmMessagesV1(token: Token, dmId: DmId, start: Start): MessageList | Error {
  if (!validDmId(dmId)) return { error: 'Invalid DM Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the DM.' };

  const data = getData();
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  if (start > data.dms[dmIndex].messages.length) return { error: 'Start is greater than total messages' };

  let end = 0;
  if (data.dms[dmIndex].messages.length + start > 50) {
    end = start + 50;
  } else {
    end = data.dms[dmIndex].messages.length;
  }

  const messagesArray = [];
  if (end !== 0) {
    for (let i = start; i < end; i++) {
      messagesArray.push(data.dms[dmIndex].messages[i]);
    }
    if (end < 50) {
      end -= 1;
    }
  }

  messagesArray.sort(function(a, b) {
    return a.timeSent - b.timeSent;
  });

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}
