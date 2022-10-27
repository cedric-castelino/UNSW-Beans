// Empty Type = {}
export type Empty = Record<string, never>;

// REMOVE IN ITERATION 3 probably
export type Error = {
  error: string;
};

// ITERATION 0 TYPES
export type Email = string;
export type ChannelId = number;
export type UId = number;
export type Password = string;
export type Message = string;
export type Start = number;
export type End = number;
export type Name = string;
export type IsPublic = boolean;

// ITERATION 1 TYPES
export type Length = number;
export type Time = number;
export type MessageId = number;

export type MessageData = {
  messageId: MessageId,
  uId: UId,
  message: Message,
  timeSent: Time,
}
export type Messages = MessageData[];

export type Channel = {
  channelId: ChannelId,
  name: Name,
};
export type Channels = Channel[];

export type HandleStr = string;

export type User = {
  uId: UId,
  nameFirst: Name,
  nameLast: Name,
  email: Email,
  handleStr: HandleStr,
};
export type Users = User[];

// ITERATION 2 TYPES
export type Token = string;
export type UIds = UId[];
export type DmId = number;
export type Dms = {
  dmId: DmId,
  name: Name,
}[];