import { getData, setData } from './dataStore';
import { UserOmitPassword, UsersOmitPassword, Error } from './objects';
import { validToken, removePassword, getUserIdFromToken } from './helper';
import validator from 'validator';

/**
  * For a valid user, returns information about a requested valid user profile
  *
  * @param {integer} authUserId - Id of user sending the request to view the profile.
  * @param {integer} uId - Id of user, whose profile is to be viewed.
  *
  * @returns {Object} {error: 'authUserId is invalid.'} - authUserId does not correspond to an existing user.
  * @returns {Object} {error: 'uId does not refer to a valid user.'}  - uId does not correspond to an existing user.
  * @returns {UserOmitPassword} User profile, without password key.
*/
export function userProfileV1 (authUserId: number, uId: number): UserOmitPassword | Error {
  const data = getData();

  if (!(data.users.some(user => user.uId === authUserId))) {
    return { error: 'authUserId is invalid.' };
  }

  if (!(data.users.find(user => user.uId === uId))) {
    return { error: 'uId does not refer to a valid user.' };
  }

  const user = data.users.find(user => user.uId === uId);
  const privateUser = removePassword(user);

  return { user: privateUser };
}

/**
 * Provides the array of all users within the dataStore.
 *
 * @param {string} token - Token of user requesting the usersAll.
 * @returns {UsersOmitPassword} All users, with passwords removed.
 */
export function usersAllV1 (token: string): UsersOmitPassword | Error {
  if (!validToken(token)) return { error: 'Invalid Session Id.' };
  const data = getData();
  const users = [];
  for (const user of data.users) {
    users.push(removePassword(user));
  }

  return {
    users: users,
  };
}

/**
 * Allows a valid authorised user to update their first and last name.
 *
 * @param {string} token - Token of user wanting to change name.
 * @param {string} nameFirst - First name that the user wants to change to.
 * @param {string} nameLast - Last name that the user wants to change to.
 *
 * @returns {Object} {} - If user successfully updates first and last name.
 * @returns {Object} { error: 'Invalid First Name.' } - If first name is too short/long.
 * @returns {Object} { error: 'Invalid Last Name.' } - If last name is too short/long.
 * @returns {Object} { error: 'Invalid Session Id.' } - If token is invalid.
 */
export function userProfileSetNameV1 (token: string, nameFirst: string, nameLast: string): Record<string, never> | Error {
  if (nameFirst.length < 1 || nameFirst.length > 50) return { error: 'Invalid First Name.' };
  if (nameLast.length < 1 || nameLast.length > 50) return { error: 'Invalid Last Name.' };
  if (!validToken(token)) return { error: 'Invalid Session Id.' };
  const data = getData();
  const userId = Number(getUserIdFromToken(token));
  data.users.find(user => user.uId === userId).nameFirst = nameFirst;
  data.users.find(user => user.uId === userId).nameLast = nameLast;
  setData(data);

  return {};
}

/**
 * Allows a valid authorised user to update their email address.
 *
 * @param {string} token - Token of user wanting to change email address.
 * @param {string} email - New email address that user wants to change to.
 *
 * @returns {Object} {} - If user successfully updates emails.
 * @returns {Object} { error: 'Invalid Email Address.' } - If email is invalid.
 * @returns {Object} { error: 'Email Already in Use.' } - If email to be changed to is already in user by another user.
 * @ returns {Object} { error: 'Invalid Session Id.' } - If token is invalid.
 */
export function userProfileSetEmailV1 (token: string, email: string): Record<string, never> | Error {
  if (!validator.isEmail(email)) return { error: 'Invalid Email Address.' };
  const data = getData();
  if (data.users.some(user => user.email === email)) return { error: 'Email Already in Use.' };
  if (!validToken(token)) return { error: 'Invalid Session Id.' };
  const userId = Number(getUserIdFromToken(token));
  data.users.find(user => user.uId === userId).email = email;
  setData(data);

  return {};
}
