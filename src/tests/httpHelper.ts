import request from 'sync-request';
import { HttpVerb } from 'sync-request';
import { port, url } from './../config.json';
const SERVER_URL = `${url}:${port}`;

function requestHelper(method: HttpVerb, path: string, payload: object, hashedToken = '') {
  let qs = {};
  let json = {};
  let headers = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  if (hashedToken !== '') {
    headers = { token: hashedToken };
  }

  const res = request(method, SERVER_URL + path, { qs, json, headers });

  if (res.statusCode !== 200) {
    return res.statusCode;
  }

  return JSON.parse(res.getBody('utf-8'));
}

// AUTH

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', { email, password });
}

export function requestAuthLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v2', {}, token);
}

export function requestAuthPasswordResetRequest(email: string) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', { email });
}

// OTHER

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

// USER

export function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

export function requestUsersAll(token: string) {
  return requestHelper('GET', '/users/all/v2', {}, token);
}

export function requestUserProfileSetName(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v2', { nameFirst, nameLast }, token);
}

export function requestUserProfileSetEmail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v2', { email }, token);
}

export function requestUserProfileSetHandle(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v2', { handleStr }, token);
}

export function requestNotificationsGet(token: string) {
  return requestHelper('GET', '/notifications/get/v1', {}, token);
}

// CHANNELS

export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

export function requestChannelsList(token: string) {
  return requestHelper('GET', '/channels/list/v3', {}, token);
}

export function requestChannelsListAll(token: string) {
  return requestHelper('GET', '/channels/listAll/v3', {}, token);
}

// CHANNEL

export function requestChannelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { channelId }, token);
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

export function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

export function requestChannelRemoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { channelId, uId }, token);
}

export function requestChannelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', { channelId, uId }, token);
}

export function requestChannelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { channelId }, token);
}

// MESSAGE

export function requestMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { channelId, message }, token);
}

export function requestMessageSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { dmId, message }, token);
}

export function requestMessageEdit(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { messageId, message }, token);
}

export function requestMessageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { messageId }, token);
}

// DM

export function requestDmCreate(token: string, uIds: Array<number>) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
}

export function requestDmList(token: string) {
  return requestHelper('GET', '/dm/list/v2', {}, token);
}

export function requestDmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { dmId }, token);
}

export function requestDmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { dmId }, token);
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, token);
}

export function requestDmRemove(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { dmId }, token);
}