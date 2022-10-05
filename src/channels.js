import { getData, setData } from './dataStore.js';
import { validUserId } from './users.js';

//Lists all channels according to authUserId
function channelsListAllV1 (authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  }
}

//Lists channels according to authUserID
function channelsListV1(authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  }
}

// Create a channel as requested by a user, given the name of the channel
// and whether it should be public/private.
// Returns the new channel id.
function channelsCreateV1(authUserId, name, isPublic ) {
  if (!validUserId(authUserId)) return {
    error: "Invalid user permissions.",
  };
  if (name.length < 1 || name.length > 20) return {
    error: "Channel name must be between 1-20 characters.",
  };

  const data = getData();
  const newChannelId = Math.floor(Math.random() * 899999 + 100000);

  const newChannel = {
    channelId: newChannelId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [],
    allMembers: [],
    messages: [],
  };

  data.channels.push(newChannel);
  const index1 = data.users.findIndex(user => user.uId === authUserId);
  const index2 = data.channels.findIndex(channel => channel.channelId === newChannelId);
  data.channels[index2].ownerMembers.push(data.users[index1]);
  data.channels[index2].allMembers.push(data.users[index1]);

  setData(data);

  console.log(newChannel);

  return { channelId: newChannel.channelId };
}

export { channelsCreateV1 };