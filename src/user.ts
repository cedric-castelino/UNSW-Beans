import { getData, setData } from './dataStore';
import validator from 'validator';
import {
  Empty,
  Token, UId,
  Name, Email,
  HandleStr
} from './interfaceTypes';
import { UserObj, UserStatsObj } from './internalTypes';
import {
  validToken,
  validUserId,
  getPublicUser,
  getUserIdFromToken,
  updateUserDetails,
} from './helper';
import { port } from './config.json';
import HTTPError from 'http-errors';
import Jimp from 'jimp';
import request from 'sync-request';
import sizeOf from 'image-size';
import fs from 'fs';
import path from 'path';

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
  if (!validUserId(uId)) throw HTTPError(400, 'Invalid User Id.');

  const data = getData();
  const user = data.users.find(user => user.uId === uId);

  return {
    user: getPublicUser(user),
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
  if (nameFirst.length < 1 || nameFirst.length > 50) throw HTTPError(400, 'Invalid First Name.');
  if (nameLast.length < 1 || nameLast.length > 50) throw HTTPError(400, 'Invalid Last Name.');
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
  if (handleStr.length < 3 || handleStr.length > 20) throw HTTPError(400, 'Invalid Handle.');
  if (handleStr.match(/^[0-9A-Za-z]+$/) === null) throw HTTPError(400, 'Invalid Handle.');
  const data = getData();
  if (data.users.some(user => user.handleStr === handleStr)) throw HTTPError(400, 'Handle Already in Use.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');

  const userId = getUserIdFromToken(token);
  data.users.find(user => user.uId === userId).handleStr = handleStr;

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
  if (!validator.isEmail(email)) throw HTTPError(400, 'Invalid Email Address.');
  const data = getData();
  if (data.users.some(user => user.email === email)) throw HTTPError(400, 'Email Already in Use.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const userId = getUserIdFromToken(token);
  data.users.find(user => user.uId === userId).email = email;

  setData(data);
  // Update user details in channel
  updateUserDetails(userId);
  return {};
}

/**
 * Gets the users' stats, including channel/dm/message info, and involvement.
 * @param {Token} token the user requesting their stats
 * @throws 403 - Invalid token, if user does not exist.
 * @returns {UserStatsObj} the users stats, contained within an object.
 */
export function userStatsV1 (token: Token): UserStatsObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const uId = getUserIdFromToken(token);
  const data = getData();

  return {
    userStats: data.users.find(user => user.uId === uId).userStats,
  };
}

/**
  * Crops a new photo and sets it as the users profile photo.
  *
  * @param {string} token - Token of user sending the request.
  * @param {number} imgUrl - The URL of the image to be uploaded.
  * @param {string} xStart - Starting x value for cropping.
  * @param {number} yStart - Starting y value for cropping.
  * @param {number} xEnd - Ending x value for cropping.
  * @param {number} yEnd - Ending y value for cropping.
  *
  * @returns {error: 'Invalid dimensions.'}  - Dimensions given were invalid.
  * @returns {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {error: 'Invalid URL.'} - URL given was invalid.
  * @returns {error: 'Error Encountered.'} - url could not be loaded.
  * @returns {} - New photo cropped and uploaded.
*/
export function userProfileUploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): Empty | Error {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (xEnd <= xStart || yEnd <= yStart) throw HTTPError(400, 'Invalid dimensions.');
  if (Math.sign(xStart) === -1 || Math.sign(yStart) === -1) throw HTTPError(400, 'Invalid dimensions.');
  if (Math.sign(xEnd) === -1 || Math.sign(yEnd) === -1) throw HTTPError(400, 'Invalid dimensions.');
  if (!imgUrl.endsWith('.jpg')) throw HTTPError(400, 'Invalid URL.');
  const randomString = (Math.random() + 1).toString(36).substring(2);
  const newPhotoUrl = 'static/' + randomString + '.jpg';
  const url = 'http://localhost:' + port + '/' + newPhotoUrl;
  const res = request(
    'GET', imgUrl
  );
  if (res.statusCode !== 200) {
    throw HTTPError(400, 'Invalid URL.');
  }
  const body = res.getBody();
  fs.writeFileSync('static/checkSize.jpg', body, { flag: 'w' });
  const dimensions = sizeOf('static/checkSize.jpg');
  fs.unlink(path.join('./static', 'checkSize.jpg'), (err) => {
    if (err) throw err;
  });
  if (xStart >= dimensions.width || xEnd > dimensions.width) throw HTTPError(400, 'Invalid dimensions.');
  if (yStart >= dimensions.height || yEnd > dimensions.height) throw HTTPError(400, 'Invalid dimensions.');
  Jimp.read(imgUrl).then(image => {
    image.crop(xStart, yStart, (xEnd - xStart), (yEnd - yStart));
    image.write(newPhotoUrl);
  })
    .catch(err => {
      throw HTTPError(400, 'Error Encountered.');
    });
  const data = getData();
  const userId = getUserIdFromToken(token);
  data.users.find(user => user.uId === userId).profileImgUrl = url;
  setData(data);
  updateUserDetails(userId);
  return {};
}
