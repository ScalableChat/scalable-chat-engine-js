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
  ChatMemberArrayOutput,
  CMChatMemberSearchFilterInput,
  CMMyChannelsFilterInput,
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
    type GQLOutput = {
      cmMyChatMember: ChatMemberOutput
    }
    const data = await client.request<GQLOutput>(query)
    return data.cmMyChatMember
  }

  static async cmMyChannels(
    client: GraphQLClient,
    cmMyChannelsFilterInput?: CMMyChannelsFilterInput
  ): Promise<CMMyChannelArrayOutput> {
    const query = gql`
      query cmMyChannels($cmMyChannelsFilterInput: CMMyChannelsFilterInput) {
        cmMyChannels(cmMyChannelsFilterInput: $cmMyChannelsFilterInput) {
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
    type GQLInput = { cmMyChannelsFilterInput: CMMyChannelsFilterInput }
    type GQLOutput = {
      cmMyChannels: CMMyChannelArrayOutput
    }
    const variables: GQLInput = { cmMyChannelsFilterInput }
    const data = await client.request<GQLOutput, GQLInput>(query, variables)
    return data.cmMyChannels
  }

  static async cmChatMembersSearch(
    client: GraphQLClient,
    cmChatMemberSearchFilterInput: CMChatMemberSearchFilterInput
  ): Promise<ChatMemberArrayOutput> {
    const query = gql`
      query cmChatMembersSearch($cmChatMemberSearchFilterInput: CMChatMemberSearchFilterInput!) {
        cmChatMembersSearch(cmChatMemberSearchFilterInput: $cmChatMemberSearchFilterInput) {
          isSuccess
          code
          errorMessage
          data {
            id
            chatAppId
            name
            photoURL
            createAt
            updateAt
          }
        }
      }
    `
    type GQLInput = { cmChatMemberSearchFilterInput: CMChatMemberSearchFilterInput }
    type GQLOutput = { cmChatMembersSearch: ChatMemberArrayOutput }

    const variables: GQLInput = { cmChatMemberSearchFilterInput }
    const data = await client.request<GQLOutput, GQLInput>(query, variables)
    return data.cmChatMembersSearch
  }

  static async cmPeerChannelGetOrCreate(
    client: GraphQLClient,
    cmPeerChannelCreateInput: CMPeerChannelCreateInput
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
    type GQLInput = { cmPeerChannelCreateInput: CMPeerChannelCreateInput }
    type GQLOutput = { cmPeerChannelGetOrCreate: ChannelOutput }

    const variables: GQLInput = {
      cmPeerChannelCreateInput,
    }
    const data = await client.request<GQLOutput, GQLInput>(mutation, variables)
    return data.cmPeerChannelGetOrCreate
  }

  static async cmGroupChannelGetOrCreate(
    client: GraphQLClient,
    cmGroupChannelCreateInput: CMGroupChannelCreateInput
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
    type GQLInput = { cmGroupChannelCreateInput: CMGroupChannelCreateInput }
    type GQLOutput = { cmGroupChannelGetOrCreate: ChannelOutput }
    const variables: GQLInput = {
      cmGroupChannelCreateInput,
    }
    const data = await client.request<GQLOutput, GQLInput>(mutation, variables)
    return data.cmGroupChannelGetOrCreate
  }

  static async cmMyChannelsMessages(
    client: GraphQLClient,
    cmMyChannelsMessagesFilterInput: CMMyChannelsMessagesFilterInput
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
    type GQLInput = { cmMyChannelsMessagesFilterInput: CMMyChannelsMessagesFilterInput }
    type GQLOutput = { cmMyChannelsMessages: ChannelMessageArrayOutput }
    const variables: GQLInput = {
      cmMyChannelsMessagesFilterInput,
    }
    const data = await client.request<GQLOutput, GQLInput>(query, variables)
    return data.cmMyChannelsMessages
  }

  static async cmChannelSendMessage(
    client: GraphQLClient,
    channelMessageCreateInput: ChannelMessageCreateInput
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
    type GQLInput = { channelMessageCreateInput: ChannelMessageCreateInput }
    type GQLOutput = { cmChannelSendMessage: ChannelMessageOutput }
    const variables: GQLInput = {
      channelMessageCreateInput,
    }
    const data = await client.request<GQLOutput, GQLInput>(mutation, variables)
    return data.cmChannelSendMessage
  }

  static async cmChannelAddMembers(
    client: GraphQLClient,
    cmChannelAddMembersInput: CMChannelAddMembersInput
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
    type GQLInput = { cmChannelAddMembersInput: CMChannelAddMembersInput }
    type GQLOutput = { cmChannelAddMembers: ChannelMemberArrayOutput }
    const variables: GQLInput = {
      cmChannelAddMembersInput,
    }
    const data = await client.request<GQLOutput, GQLInput>(mutation, variables)
    return data.cmChannelAddMembers
  }
}
