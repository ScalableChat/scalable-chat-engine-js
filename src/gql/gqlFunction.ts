import { GraphQLClient, gql } from 'graphql-request'
import {
  ChannelMessageCreateInput,
  ChannelMessageOutput,
  CMChannelAddMembersInput,
  ChannelMemberArrayOutput,
  CMMyChannelArrayOutput,
  ChannelMessageArrayOutput,
  CMMyChannelsMessagesFilterInput,
} from './type'

export abstract class GQLFunction {
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
