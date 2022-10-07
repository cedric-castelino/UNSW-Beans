import { getData, setData } from './dataStore.js';
import { validUserId, validChannelId, checkUserIdtoChannel } from './users.js';

// Sends a message from a user to a given channel, recording time sent.
export function channelMessagesV1(authUserId, channelId, start) {
  if (!validChannelId(channelId)) return { error: 'Not valid channelId' }
  if (!validUserId(authUserId)) return { error: 'Invalid Authorised User Id.' };
  const data = getData()
  const index = data.channels.findIndex(channel => channel.channelId === channelId);
  if (start > data.channels[index].messages.length) return { error: 'Start is greater than total messages'};

  if (Boolean(data.channels[index].allMembers.some(users => users.uId === authUserId)) === false) return {
    error: 'Authorised user is not a channel member'
  }

  var end = 0;
  if (data.channels[index].messages.length + start > 50) {
    end = start + 50;
  } else {
    if (data.channels[index].messages.length !== 0) {
      end -= 1;
    }
  }

  const messagesArray = new Array();
  for (let i = start; i < end - start; i++) {
    messagesArray.push(data.channels[index].messages[i]);
  }

  messagesArray.sort(function(a,b){
    return new Date(a.timeSent) - new Date(b.timeSent);
  });

  const returnedMessages = {
    messages: messagesArray,
    start: start,
    end: end,
  }

  return returnedMessages;
}


/* Helper function intended to implement message sending for the sake of future 
/* iterations of channel messages. 
/*
export function channelSendMessageV1 (authUserId, channelId, message) {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' }
  if (!validUserId(authUserId)) return { error: 'Invalid Authorised User Id.' };

  const data = getData();
  const index = data.channels.findIndex(channel => channel.channelId === channelId);
  const messageId = Math.floor(Math.random() * 899999 + 100000);
  const messageTime = new Date().getTime();

  const newMessage = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: messageTime,
  }

  data.channels[index].messages.push(newMessage);
  setData(data);
  return { messageId: messageId };
}
*/

// Sends a user specific invite to a given channel 
export function channelInviteV1(authUserId, channelId, uId) {

  if (!validChannelId(channelId)) {
    return {
      error: 'Invalid Channel Id.'
    }
  } 
  if (!validUserId(uId)) {
    return {
      error: 'Invalid User Id.'
    }
  } 
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    }
  } 
  if (checkUserIdtoChannel(uId, channelId)) {
    return {
      error: 'User is already a member.'
    }
  } 
  if (!checkUserIdtoChannel(authUserId, channelId)) {
    return {
      error: 'Authorised User is not a member.'
    }
  } 
    
  const data = getData();

  const index1 = data.users.findIndex(user => user.uId === uId);
  const index2 = data.channels.findIndex(channel => channel.channelId === channelId);
  data.channels[index2].allMembers.push(data.users[index1]);

  setData(data);
  return {};
}

// Provides the details of the owner and members of a given channel
export function channelDetailsV1(authUserId, channelId) {

  if (!validChannelId(channelId)) {
    return {
      error: 'Invalid Channel Id.'
    }
  } 
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    }
  } 
  if (!checkUserIdtoChannel(authUserId, channelId)) {
    return {
      error: 'Authorised User is not a member.'
    }
  } 

  const data = getData();

  const userIndex = data.users.findIndex(user => user.uId === authUserId);
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);

  setData(data);
  return {
	  name: data.channels[channelIndex].name,
    isPublic: data.channels[channelIndex].isPublic,
	  ownerMembers: data.channels[channelIndex].ownerMembers,
    allMembers: data.channels[channelIndex].allMembers,
  };
}

// Allows user to join channel given a UserId
export function channelJoinV1(authUserId, channelId) {

  const data = getData();
  
  let i = 0;
  for (const chann of data.channels) {
    if (channelId === chann.channelId) {
      i++;
    }
  }

  if (i === 0) {
    return {
      error: 'Invalid Channel Id.'
    }
  }
  
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid User Id.'
    }
  }
  
  const channelIndex = data.channels.map(object => object.channelId).indexOf(channelId);
  const userIndex = data.users.findIndex(user => user.uId === authUserId);
  if (data.channels[channelIndex].allMembers.includes(data.users[userIndex]) === true) {
    return {
      error: 'You are already a member.'
    }
  }
  
  if (data.channels[channelIndex].isPublic === false 
      && data.channels[channelIndex].allMembers.includes(authUserId) === false 
      && data.users[0].uId !== authUserId) {
    return { error: 'You do not have access to this channel.' }
  }

  data.channels[channelIndex].allMembers.push(data.users[userIndex]);
  setData(data);
  
  return {};
}
