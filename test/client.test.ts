import { ChannelMemberRole, ChannelMemberStatus, ChannelMessageType, LogLevel, ScalableChatEngine } from '../src/index'

interface Error {
  name: string;
  message: string;
  stack?: string;
}

describe('WebSocket Client module test', () => {
  let client: ScalableChatEngine
  let chatAppId:string = "2a839830-7a36-410f-8f77-15f6b5d7440c"
  let chatMemberId:string = "14beea20-4130-4deb-89ab-6ad6d22672f1"
  let name:string = "Louis"

  beforeAll(() => {
    // Start server
    client = ScalableChatEngine.getInstance(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGF0QXBwSWQiOiIyYTgzOTgzMC03YTM2LTQxMGYtOGY3Ny0xNWY2YjVkNzQ0MGMiLCJjaGF0TWVtYmVySWQiOiIxNGJlZWEyMC00MTMwLTRkZWItODlhYi02YWQ2ZDIyNjcyZjEiLCJpYXQiOjE2NTk5NjIxMjJ9.WOP-8R-WqLUV_KcpUWggnbaHZMGZ8ppzfvf-Vk-f-FI',
      {
        wsURL: 'http://localhost:3100',
        gqlURL: 'http://localhost:7100/graphql',
        logLevel: LogLevel.PRODUCTION,
      }
    )
  })
  afterAll(() => {
    // Close server
    client.shutdown()
  })


  test('Get My ChatMember', async () => {
    const result = await client.getMyChatMember()
    expect(result.isSuccess).toBe(true)
    expect(result.code).toBe(200)
    expect(result.data).toBeDefined()
    expect(result.data?.chatAppId).toBe(chatAppId)
    expect(result.data?.id).toBe(chatMemberId)
    expect(result.data?.name).toBe(name)
  })


  let channelIds:string[] = []
  test('Get My Channels', async () => {
    const myChannels = await client.getMyChannels()
    expect(myChannels.isSuccess).toBe(true)
    expect(myChannels.code).toBe(200)
    expect(myChannels.data).toBeDefined()
    myChannels!.data?.forEach(myChannel=>{
      channelIds.push(myChannel.channel.id)
      expect(myChannel.channel.id).toBe(myChannel.channelMember.channelId)

      // verify channel member and chat member
      myChannel.channel.channelMembers.forEach(channelMember=>{
        if(channelMember.chatMember !== null){
          expect(channelMember.chatMemberId).toBe(channelMember.chatMember.id)
        }
      })
    })
  })

  test('Get My Channels Messages', async () => {
    const result = await client.getMyChannelsMessages({
      channelIds:channelIds,
      fromTime: new Date("2022-01-01").toISOString()
    })
    expect(result.isSuccess).toBe(true)
    expect(result.code).toBe(200)
    expect(result.data).toBeDefined()
    expect(result.data?.length).toBeGreaterThanOrEqual(1)
    result!.data?.forEach(e=>{
      expect(channelIds).toContain(e.channelId)
    })
  })


  test('Create or Get Non exist Peer Channel', async () => {
    const channelResult = await client.createOrGetPeerChannel({
      chatMemberId:"33e6f3ac-a115-465d-9a49-1e0df5a1990b"
    })
    expect(channelResult.isSuccess).toBe(false)
    expect(channelResult.code).toBe(400)
    expect(channelResult.errorMessage).toBe("Fail cmPeerChannelGetOrCreate. Peer not found in chat member list.")
  })

  test('Create or Get exist Peer Channel', async () => {
    const targetChatMemberId = "5b3d3c5a-eceb-4f6b-81a6-2c98650dc52e"
    const channelResult = await client.createOrGetPeerChannel({
      chatMemberId:targetChatMemberId
    })
    const sortedMemberIds = [chatMemberId,targetChatMemberId ].sort()

    expect(channelResult.isSuccess).toBe(true)
    expect(channelResult.code).toBe(200)
    expect(channelResult.data?.id).toBe(sortedMemberIds.join("@"))
  })

  test('Create Group Channel', async () => {
    const targetChatMemberId = "5b3d3c5a-eceb-4f6b-81a6-2c98650dc52e"
    const channelResult = await client.createGroupChannel({
      chatMemberIds:[targetChatMemberId]
    })

    expect(channelResult.isSuccess).toBe(true)
    expect(channelResult.code).toBe(200)
    const channel = channelResult.data

    // all members inside
    expect(channel?.channelMembers.length).toBe(2)

    channel?.channelMembers.forEach(channelMember=>{
      expect(channelMember.chatMemberId).toBeDefined()
      expect(channelMember.channelId).toBe(channel.id)
      expect(channelMember.chatAppId).toBe(channel.chatAppId)
      expect(channelMember.chatMember).toBeDefined()
      expect(channelMember.chatMember.id).toBe(channelMember.chatMemberId)
      expect(channelMember?.roles).toContain(ChannelMemberRole.MEMBER)
      expect(channelMember?.status).toBe(ChannelMemberStatus.ACTIVE)
    })
    // creator is owner
    const creator = channel?.channelMembers.find(e=>e.chatMemberId === chatMemberId)
    expect(creator).toBeDefined()
    expect(creator?.chatMemberId).toBe(chatMemberId)
    // creator Role is owner
    expect(creator?.roles).toContain(ChannelMemberRole.OWNER)
  })

  test('Send Text Message', async () => {
    const newMessage = 'Hello World123'
    const channel = client.getChannel('33e6f3ac-a115-465d-9a49-1e0df5a1990b')
    const result = await channel.sendTextMessage(newMessage)
    expect(result.isSuccess).toBe(true)
    expect(result.code).toBe(200)
    expect(result.data?.channelId).toBe('33e6f3ac-a115-465d-9a49-1e0df5a1990b')
    expect(result.data?.message).toBe(newMessage)
    expect(result.data?.messageType).toBe(ChannelMessageType.TEXT)
  })



  // test('the fetch fails with an error', async () => {
  //   try {
  //     const channel = client.getChannel('abc')
  //     const result = await channel.sendTextMessage('fail message abc')
  //   } catch (e) {
  //     console.log("test",JSON.stringify(e))
  //     const error = e as Error
  //     console.log("e", error.name)
  //     console.log("e", error.message)
  //     console.log("e", error.stack)
  //     expect(error).toMatch(`sendTextMessage error. Channel Member Not Found`)
  //   }
  // })

  // test('the fetch fails with an error', async () => {
  //   expect.assertions(1)
  //   try {
  //     const channel = client.getChannel('abc')
  //     const result = await channel.sendTextMessage('fail message abc')
  //   } catch (e) {
  //     console.log("e", e)
  //     const finalError = getGQLErrorMessages(e)
  //     console.log("finalError", finalError)
  //     expect(finalError).toMatch(`sendTextMessage error. Channel Member Not Found`)
  //   }
  // })
  // test("Server echoes the message it receives from client", () => {
  //   // 1. Create test client
  //   // 2. Send client message
  //   // 3. Close the client after it receives the response
  //   // 4. Perform assertions on the response
  // });
})

// const client = ScalableChatEngine.getInstance(
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGF0QXBwSWQiOiIyYTgzOTgzMC03YTM2LTQxMGYtOGY3Ny0xNWY2YjVkNzQ0MGMiLCJjaGF0TWVtYmVySWQiOiI1YjNkM2M1YS1lY2ViLTRmNmItODFhNi0yYzk4NjUwZGM1MmUiLCJpYXQiOjE2NTgyMDkxODB9.D9FHUVDvmmTdCSfwL6E3DgQz4j-COH9VlVgyKIvNMi4",
//   {
//     wsURL:'http://localhost:3100',
//     gqlURL:"http://localhost:7100/graphql",
//     logLevel:LogLevel.DEBUG,
//   }
// );
