import { getData, setData } from './dataStore';
import validator from 'validator';
import {
  Empty,
  Users,
  Token, UId,
  Name, Email,
  HandleStr,
} from './interfaceTypes';
import { UserObj } from './internalTypes';
import {
  validToken,
  validUserId,
  getPublicUser,
  getUserIdFromToken,
  updateUserDetails,
} from './helper';
import HTTPError from 'http-errors';

/**
  * For a valid user, returns information about a requested valid user profile
  *
  * @param {Token} token - Token of user requesting the profile.
  * @param {UId} uId - Id of user whose profile is to be viewed.
  *
  * @returns {Error} {error: 'authUserId is invalid.'} - authUserId does not correspond to an existing user.
  * @returns {Error} {error: 'uId does not refer to a valid user.'}  - uId does not correspond to an existing user.
  * @returns {User} User profile, without password key.
*/
export function userProfileV3 (token: Token, uId: UId): UserObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (!validUserId(uId)) throw new HTTPError(400, 'Invalid User Id.');

  const data = getData();
  const user = data.users.find(user => user.uId === uId);

  return {
    user: getPublicUser(user),
  };
}

/**
 * Provides the array of all users within the dataStore.
 *
 * @param {Token} token - Token of user requesting the usersAll.
 * @returns {Users} {users: [...]} - All users, with passwords removed.
 * @returns {Error} { error: 'Invalid Session Id.' } if token is invalid
 */
export function usersAllV2 (token: Token): {users: Users} {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const data = getData();
  const users = [];
  for (const user of data.users) {
    users.push(getPublicUser(user));
  }

  return {
    users: users,
  };
}

/**
 * Allows a valid authorised user to update their first and last name.
 *
 * @param {Token} token - Token of user wanting to change name.
 * @param {Name} nameFirst - First name that the user wants to change to.
 * @param {Name} nameLast - Last name that the user wants to change to.
 *
 * @returns {Empty} {} - If user successfully updates first and last name.
 * @returns {Error} { error: 'Invalid First Name.' } - If first name is too short/long.
 * @returns {Error} { error: 'Invalid Last Name.' } - If last name is too short/long.
 * @returns {Error} { error: 'Invalid Session Id.' } - If token is invalid.
 */
export function userProfileSetNameV2 (token: Token, nameFirst: Name, nameLast: Name): Empty {
  if (nameFirst.length < 1 || nameFirst.length > 50) throw new HTTPError(400, 'Invalid First Name.');
  if (nameLast.length < 1 || nameLast.length > 50) throw new HTTPError(400, 'Invalid Last Name.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');

  const data = getData();

  const userId = getUserIdFromToken(token);
  data.users.find(user => user.uId === userId).nameFirst = nameFirst;
  data.users.find(user => user.uId === userId).nameLast = nameLast;

  setData(data);
  // Update user details in channel
  updateUserDetails(userId);

  return {};
}

/**
 * Allows a valid authorised user to update their email address.
 *
 * @param {Token} token - Token of user wanting to change email address.
 * @param {Email} email - New email address that user wants to change to.
 *
 * @returns {Empty} {} - If user successfully updates emails.
 * @returns {Error} { error: 'Invalid Email Address.' } - If email is invalid.
 * @returns {Error} { error: 'Email Already in Use.' } - If email to be changed to is already in user by another user.
 * @returns {Error} { error: 'Invalid Session Id.' } - If token is invalid.
 */
export function userProfileSetEmailV2 (token: Token, email: Email): Empty {
  if (!validator.isEmail(email)) throw new HTTPError(400, 'Invalid Email Address.');
  const data = getData();
  if (data.users.some(user => user.email === email)) throw new HTTPError(400, 'Email Already in Use.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const userId = getUserIdFromToken(token);
  data.users.find(user => user.uId === userId).email = email;

  setData(data);
  // Update user details in channel
  updateUserDetails(userId);
  return {};
}

/**
 * Allows a valid authorised user to update their handle (display name).
 *
 * @param {Token} token - Token of user wanting to change handle.
 * @param {HandleStr} handle - New handle that user wants to change to.
 *
 * @returns {Error} { error: 'Invalid Handle.' } - If new handle is too long/short/contains non-alphanumeric characters
 * @returns {Error} { error: 'Handle Already in Use.' } - If handle is already used by another user.
 * @returns {Error} { error: 'Invalid Session Id. } - If token is invalid.
 * @returns {Empty} {} - If user successfully updates handle.
 */
export function userProfileSetHandleV2 (token: Token, handleStr: HandleStr): Empty {
  if (handleStr.length < 3 || handleStr.length > 20) throw new HTTPError(400, 'Invalid Handle.');
  if (handleStr.match(/^[0-9A-Za-z]+$/) === null) throw new HTTPError(400, 'Invalid Handle.');
  const data = getData();
  if (data.users.some(user => user.handleStr === handleStr)) throw new HTTPError(400, 'Handle Already in Use.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');

  const userId = getUserIdFromToken(token);
  data.users.find(user => user.uId === userId).handleStr = handleStr;

  setData(data);
  // Update user details in channel
  updateUserDetails(userId);
  return {};
}
