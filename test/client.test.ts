import { ChannelMessageType, LogLevel, ScalableChatEngine } from '../src/index'

interface Error {
  name: string;
  message: string;
  stack?: string;
}

describe('WebSocket Client module test', () => {
  let client: ScalableChatEngine
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

  let channelIds = []
  test('Get My Channels', async () => {
    const result = await client.getMyChannels()
    expect(result.isSuccess).toBe(true)
    expect(result.code).toBe(200)
    expect(result.data).toBeDefined()
    result!.data?.forEach(e=>{
      channelIds.push(e.channel.id)
      expect(e.channel.id).toBe(e.channelMember.channelId)
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
