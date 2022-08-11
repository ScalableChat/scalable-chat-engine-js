import { Manager, Socket, SocketOptions } from 'socket.io-client'
import { GraphQLClient } from 'graphql-request'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { isBoolean, isString } from './utils'
import {
  Channel,
  ChannelMemberArrayOutput,
  ChannelMemberCreateInput,
  ChannelMessage,
  ChannelMessageArrayOutput,
  ChannelMessageOutput,
  ChannelMessageType,
  ChannelOutput,
  ChatMemberArrayOutput,
  ChatMemberOutput,
  CMChatMemberSearchFilterInput,
  CMGroupChannelCreateInput,
  CMMyChannelArrayOutput,
  CMMyChannelsMessagesFilterInput,
  CMPeerChannelCreateInput,
} from './gql/type'
import { getGQLErrorMessages } from './gql/gqlErrorObject'
import { GQLFunction } from './gql/gqlFunction'
import { WSServerEvent } from './ws-events/ws-server-event.enum'
export enum LogLevel {
  PRODUCTION = 9,
  LOG = 1,
  DEBUG = 0,
}
export class ScalableChatEngineOptions {
  isBrowser?: boolean = false //for persistence purpose only
  wsURL?: string
  baseURL?: string
  gqlURL?: string
  logLevel?: LogLevel = LogLevel.PRODUCTION

  constructor(data: Partial<ScalableChatEngineOptions>) {
    Object.assign(this, data)
  }
}

export class ScalableChatEngine {
  private static _instance?: ScalableChatEngine
  protected socketManager?: Manager
  protected chatSocket?: Socket
  protected gqlClient: GraphQLClient
  options: ScalableChatEngineOptions
  key: string
  secret?: string
  chatAppId?: string
  chatMemberId?: string
  isBrowser: boolean
  isNode: boolean
  axiosInstance: AxiosInstance
  // baseURL?:string = "asd"
  // wsURL?:string = "asd"
  // gqlURL?:string = "asd"

  // hooks
  onNewMessage?: (message: ChannelMessage) => void
  onNewChannel?: (channel: Channel) => void

  private constructor(key: string, options?: ScalableChatEngineOptions)
  private constructor(key: string, secret?: string, options?: ScalableChatEngineOptions)
  private constructor(
    key: string,
    secretOrOptions?: ScalableChatEngineOptions | string,
    options?: ScalableChatEngineOptions
  ) {
    this.key = key
    // mute channel
    // mute user

    if (secretOrOptions && isString(secretOrOptions)) {
      this.secret = secretOrOptions
    }

    const inputOptions = options
      ? options
      : secretOrOptions && !isString(secretOrOptions)
      ? secretOrOptions
      : new ScalableChatEngineOptions({})
    this.isBrowser = isBoolean(inputOptions?.isBrowser) ? inputOptions?.isBrowser : typeof window !== undefined
    this.isNode = !this.isBrowser
    this.options = {
      ...inputOptions,
    }

    // // Check options
    // if (!IsDefinedNotNull(this.options.baseURL)) {
    //   throw new Error('baseURL cannot be null')
    // }
    // if (!IsDefinedNotNull(this.getWSURL())) {
    //   throw new Error('wsURL cannot be null')
    // }
    // if (!IsDefinedNotNull(this.getGqlURL())) {
    //   throw new Error('gqlURL cannot be null')
    // }

    // init Axios
    const axiosConfig: AxiosRequestConfig = {
      timeout: 3000,
      withCredentials: false,
      baseURL: this.getBaseURL(),
    }
    this.axiosInstance = axios.create(axiosConfig)

    // Init GQL client
    this.gqlClient = new GraphQLClient(this.getGqlURL())
    this.gqlClient.setHeader('authorization', this._getAuthToken())

    // Init socket Manager
    const transports = ['websocket']
    this.socketManager = new Manager(this.getWSURL(), {
      reconnectionDelayMax: 10000,
      transports: transports,
    })
    this._applySocketManagerEventHandler(this.socketManager)
    this.chatSocket = this._getNamespaceSocket({
      namespace: '/chat',
      socketOptions: {
        auth: {
          jwt: this.key,
        },
      },
    })
    this._applySocketEventHandler(this.chatSocket)

    this.getLogLevel() <= LogLevel.LOG && console.log(`${ScalableChatEngine.name} Initialized`)
  }

  getWSURL = (): string => {
    return this.options.wsURL ?? 'http://localhost:3100'
  }

  getBaseURL = (): string => {
    return this.options.baseURL ?? 'http://localhost:7100'
  }

  getGqlURL = (): string => {
    return this.options.gqlURL ?? 'http://localhost:7100/graphql'
  }

  getLogLevel = (): LogLevel => {
    return this.options.logLevel ?? LogLevel.PRODUCTION
  }

  public static getInstance(key: string, options?: ScalableChatEngineOptions): ScalableChatEngine
  public static getInstance(key: string, secret?: string, options?: ScalableChatEngineOptions): ScalableChatEngine
  public static getInstance(
    key: string,
    secretOrOptions?: ScalableChatEngineOptions | string,
    options?: ScalableChatEngineOptions
  ): ScalableChatEngine {
    if (!ScalableChatEngine._instance) {
      if (isString(secretOrOptions)) {
        // is secret, in server side
        ScalableChatEngine._instance = new ScalableChatEngine(key, secretOrOptions, options)
      } else {
        ScalableChatEngine._instance = new ScalableChatEngine(key, secretOrOptions)
      }
    }
    return ScalableChatEngine._instance as ScalableChatEngine
  }

  private getSocketManager(): Manager {
    if (!this.socketManager) {
      throw new Error('SocketManager Not Initialized')
    }
    return this.socketManager
  }

  private getChatSocket(): Socket {
    if (!this.chatSocket) {
      throw new Error('Socket Not Initialized')
    }
    return this.chatSocket
  }

  private _applySocketManagerEventHandler(socketManager: Manager) {
    this.getSocketManager()
    socketManager.on('open', () => {
      this.getLogLevel() <= LogLevel.LOG && console.log('Manager connect')
    })
    socketManager.on('close', (reason) => {
      this.getLogLevel() <= LogLevel.LOG && console.log('Manager close', reason)
    })
    socketManager.on('packet', (packet) => {
      if (this.getLogLevel() <= LogLevel.DEBUG) {
        console.group('Manager packet')
        console.dir(packet, { depth: null })
        console.groupEnd()
      }
    })
    socketManager.on('ping', () => {
      this.getLogLevel() <= LogLevel.DEBUG && console.log('Manager ping')
    })
    socketManager.on('reconnect', (attempt) => {
      this.getLogLevel() <= LogLevel.DEBUG && console.log('Manager Reconnect success: ', attempt)
    })
    socketManager.on('reconnect_attempt', (attempt) => {
      this.getLogLevel() <= LogLevel.DEBUG && console.log('Manager Reconnect attempt: ', attempt)
    })
    socketManager.on('reconnect_error', (err) => {
      this.getLogLevel() <= LogLevel.DEBUG && console.error('Manager Reconnect err: ', err)
    })
    socketManager.on('reconnect_failed', () => {
      this.getLogLevel() <= LogLevel.DEBUG && console.error('Manager Reconnect failed')
    })
  }

  private _getNamespaceSocket = (props: { namespace: string; socketOptions: Partial<SocketOptions> }) => {
    const _socketManager = this.getSocketManager()
    const { namespace = '/', socketOptions } = props
    try {
      const socket = _socketManager.socket(namespace, socketOptions)

      this.getLogLevel() <= LogLevel.DEBUG && console.log(`socket create namespace ${namespace} success`)
      return socket
    } catch (error) {
      this.getLogLevel() <= LogLevel.DEBUG &&
        console.error(`getSocket error, ns: ${namespace}, socketOptions: ${JSON.stringify(socketOptions)}`)
      throw new Error('Failed to get socket from socket manager')
    }
  }

  private _applySocketEventHandler(socket: Socket) {
    socket.on('connect', () => {
      this.getLogLevel() <= LogLevel.DEBUG && console.log(`Socket connected`)
    })

    socket.on('disconnect', (reason) => {
      this.getLogLevel() <= LogLevel.DEBUG && console.log(`Socket disconnect due to ${reason}`)
    })

    socket.on('connect_error', (error) => {
      this.getLogLevel() <= LogLevel.DEBUG && console.error('Socket Connect err: ', error)
    })

    socket.onAny((event, data) => {
      this.socketEventHandler(event, data)
    })
  }

  private socketEventHandler = (event: string, data: any) => {
    switch (event) {
      case WSServerEvent.NEW_MESSAGE:
        this.onNewMessage && this.onNewMessage(data as ChannelMessage)
        break
      case 'NEW_CHANNEL':
        this.onNewChannel && this.onNewChannel(data as Channel)
        break
      default:
        console.group('Drop Socket Event')
        console.log('event', event)
        console.log('data', data)
        console.groupEnd()
    }
  }

  _getAuthToken() {
    return `Bearer ${this.key}`
  }

  getChannel(channelId: string): SChannel {
    return new SChannel(this, channelId)
  }

  shutdown() {
    this.getChatSocket().close()
  }

  async getMyChatMember(): Promise<ChatMemberOutput> {
    try {
      const sendResult = await GQLFunction.cmMyChatMember(this.gqlClient)
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.getMyChatMember.name} error. ${errorMessages.join('\n')}`)
    }
  }

  async getMyChannels(): Promise<CMMyChannelArrayOutput> {
    try {
      const sendResult = await GQLFunction.cmMyChannels(this.gqlClient)
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.getMyChannels.name} error. ${errorMessages.join('\n')}`)
    }
  }

  async getMyChannelsMessages(
    cmMyChannelsMessagesFilterInput: CMMyChannelsMessagesFilterInput
  ): Promise<ChannelMessageArrayOutput> {
    try {
      const sendResult = await GQLFunction.cmMyChannelsMessages(cmMyChannelsMessagesFilterInput, this.gqlClient)
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.getMyChannelsMessages.name} error. ${errorMessages.join('\n')}`)
    }
  }

  async searchChatMembers(
    name: string
    // cmChatMemberSearchFilterInput: CMChatMemberSearchFilterInput
  ): Promise<ChatMemberArrayOutput> {
    try {
      const sendResult = await GQLFunction.cmChatMembersSearch(
        {
          name,
          pagination: {}, // force 10 or server limit
        },
        this.gqlClient
      )
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.getMyChannelsMessages.name} error. ${errorMessages.join('\n')}`)
    }
  }

  async createOrGetPeerChannel(cmPeerChannelCreateInput: CMPeerChannelCreateInput): Promise<ChannelOutput> {
    try {
      const sendResult = await GQLFunction.cmPeerChannelGetOrCreate(cmPeerChannelCreateInput, this.gqlClient)
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.createOrGetPeerChannel.name} error. ${errorMessages.join('\n')}`)
    }
  }

  async createGroupChannel(cmGroupChannelCreateInput: CMGroupChannelCreateInput): Promise<ChannelOutput> {
    try {
      const sendResult = await GQLFunction.cmGroupChannelGetOrCreate(cmGroupChannelCreateInput, this.gqlClient)
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.createOrGetPeerChannel.name} error. ${errorMessages.join('\n')}`)
    }
  }
}

class SChannel {
  private gqlClient: GraphQLClient
  readonly channelId: string
  constructor(public parent: ScalableChatEngine, channelId: string) {
    this.channelId = channelId
    this.gqlClient = new GraphQLClient(parent.getGqlURL())
    this.gqlClient.setHeader('authorization', parent._getAuthToken())
    this.gqlClient.setHeader('channelId', this.channelId)
  }

  async sendTextMessage(message: string): Promise<ChannelMessageOutput> {
    try {
      const sendResult = await GQLFunction.cmChannelSendMessage(
        {
          // message: null as any as string,
          message,
          messageType: ChannelMessageType.TEXT,
        },
        this.gqlClient
      )
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.sendTextMessage.name} error. ${errorMessages.join('\n')}`)
    }
  }

  async addNewMembers(channelMemberCreateInputs: ChannelMemberCreateInput[]): Promise<ChannelMemberArrayOutput> {
    try {
      const sendResult = await GQLFunction.cmChannelAddMembers(
        {
          channelMemberCreateInputs,
        },
        this.gqlClient
      )
      return sendResult
    } catch (error) {
      const errorMessages = getGQLErrorMessages(error)
      throw new Error(`${this.addNewMembers.name} error. ${errorMessages.join('\n')}`)
    }
  }
}
