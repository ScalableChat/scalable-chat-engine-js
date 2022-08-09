import { GraphQLClient, gql } from 'graphql-request'
import {
  ChannelMessageCreateInput,
  ChannelMessageOutput,
  CMChannelAddMembersInput,
  ChannelMemberArrayOutput,
  CMMyChannelArrayOutput,
  ChannelMessageArrayOutput,
  CMMyChannelsMessagesFilterInput,
  ChatMemberOutput,
  ChannelOutput,
  CMPeerChannelCreateInput,
  CMGroupChannelCreateInput,
} from './type'

export abstract class GQLFunction {
  static async cmMyChatMember(client: GraphQLClient): Promise<ChatMemberOutput> {
    const query = gql`
      query {
        cmMyChatMember {
          isSuccess
          code
          errorMessage
          data {
            id
            chatAppId
            photoURL
            name
            createAt
            updateAt
          }
        }
      }
    `
    const data = await client.request<{
      cmMyChatMember: ChatMemberOutput
    }>(query)
    return data.cmMyChatMember
  }

  static async cmMyChannels(client: GraphQLClient): Promise<CMMyChannelArrayOutput> {
    const mutation = gql`
      query {
        cmMyChannels {
          isSuccess
          code
          errorMessage
          data {
            channel {
              id
              name
              photoURL
              description
              status
              isDirect
              createAt
              updateAt
              channelMembers {
                id
                channelId
                chatMemberId
                status
                roles
                createAt
                updateAt
                chatMember {
                  id
                  name
                  photoURL
                }
              }
            }
            channelMember {
              id
              channelId
              chatMemberId
              status
              roles
              createAt
              updateAt
            }
          }
        }
      }
    `
    const data = await client.request<{
      cmMyChannels: CMMyChannelArrayOutput
    }>(mutation)
    return data.cmMyChannels
  }

  static async cmPeerChannelGetOrCreate(
    cmPeerChannelCreateInput: CMPeerChannelCreateInput,
    client: GraphQLClient
  ): Promise<ChannelOutput> {
    const mutation = gql`
      mutation cmPeerChannelGetOrCreate($cmPeerChannelCreateInput: CMPeerChannelCreateInput!) {
        cmPeerChannelGetOrCreate(cmPeerChannelCreateInput: $cmPeerChannelCreateInput) {
          isSuccess
          code
          errorMessage
          data {
            id
            name
            photoURL
            description
            status
            isDirect
            channelMembers {
              id
              channelId
              chatMemberId
              chatMember {
                id
                name
                photoURL
              }
              status
              roles
              createAt
              updateAt
            }
          }
        }
      }
    `
    const variables = {
      cmPeerChannelCreateInput: cmPeerChannelCreateInput,
    }
    const data = await client.request<
      {
        cmPeerChannelGetOrCreate: ChannelOutput
      },
      {
        cmPeerChannelCreateInput: CMPeerChannelCreateInput
      }
    >(mutation, variables)
    return data.cmPeerChannelGetOrCreate
  }

  static async cmGroupChannelGetOrCreate(
    cmGroupChannelCreateInput: CMGroupChannelCreateInput,
    client: GraphQLClient
  ): Promise<ChannelOutput> {
    const mutation = gql`
      mutation cmGroupChannelGetOrCreate($cmGroupChannelCreateInput: CMGroupChannelCreateInput!) {
        cmGroupChannelGetOrCreate(cmGroupChannelCreateInput: $cmGroupChannelCreateInput) {
          isSuccess
          code
          errorMessage
          data {
            id
            name
            photoURL
            description
            status
            isDirect
            channelMembers {
              id
              channelId
              chatMemberId
              chatMember {
                id
                name
                photoURL
              }
              status
              roles
              createAt
              updateAt
            }
          }
        }
      }
    `
    const variables = {
      cmGroupChannelCreateInput: cmGroupChannelCreateInput,
    }
    const data = await client.request<
      {
        cmGroupChannelGetOrCreate: ChannelOutput
      },
      {
        cmGroupChannelCreateInput: CMGroupChannelCreateInput
      }
    >(mutation, variables)
    return data.cmGroupChannelGetOrCreate
  }

  static async cmMyChannelsMessages(
    cmMyChannelsMessagesFilterInput: CMMyChannelsMessagesFilterInput,
    client: GraphQLClient
  ): Promise<ChannelMessageArrayOutput> {
    const query = gql`
      query cmMyChannelsMessages($cmMyChannelsMessagesFilterInput: CMMyChannelsMessagesFilterInput!) {
        cmMyChannelsMessages(cmMyChannelsMessagesFilterInput: $cmMyChannelsMessagesFilterInput) {
          isSuccess
          code
          errorMessage
          data {
            id
            channelId
            chatMemberId
            channelMemberId
            message
            messageType
            url
            createAt
            updateAt
          }
        }
      }
    `
    const variables = {
      cmMyChannelsMessagesFilterInput,
    }
    const data = await client.request<
      {
        cmMyChannelsMessages: ChannelMessageArrayOutput
      },
      {
        cmMyChannelsMessagesFilterInput: CMMyChannelsMessagesFilterInput
      }
    >(query, variables)
    return data.cmMyChannelsMessages
  }

  static async cmChannelSendMessage(
    channelMessageCreateInput: ChannelMessageCreateInput,
    client: GraphQLClient
  ): Promise<ChannelMessageOutput> {
    const mutation = gql`
      mutation cmChannelSendMessage($channelMessageCreateInput: ChannelMessageCreateInput!) {
        cmChannelSendMessage(channelMessageCreateInput: $channelMessageCreateInput) {
          isSuccess
          code
          errorMessage
          data {
            id
            channelId
            channelMemberId
            chatMemberId
            message
            messageType
            url
          }
        }
      }
    `
    const variables = {
      channelMessageCreateInput,
    }
    const data = await client.request<
      {
        cmChannelSendMessage: ChannelMessageOutput
      },
      {
        channelMessageCreateInput: ChannelMessageCreateInput
      }
    >(mutation, variables)
    return data.cmChannelSendMessage
  }

  static async cmChannelAddMembers(
    cmChannelAddMembersInput: CMChannelAddMembersInput,
    client: GraphQLClient
  ): Promise<ChannelMemberArrayOutput> {
    const mutation = gql`
      mutation cmChannelAddMembers($cmChannelAddMembersInput: CMChannelAddMembersInput!) {
        cmChannelAddMembers(cmChannelAddMembersInput: $cmChannelAddMembersInput) {
          isSuccess
          code
          errorMessage
          data {
            id
            channelId
            message
            messageType
            url
          }
        }
      }
    `
    const variables = {
      cmChannelAddMembersInput,
    }
    const data = await client.request<
      {
        cmChannelAddMembers: ChannelMemberArrayOutput
      },
      {
        cmChannelAddMembersInput: CMChannelAddMembersInput
      }
    >(mutation, variables)
    return data.cmChannelAddMembers
  }
}
