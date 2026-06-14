import { BaseWsEvent } from 'src/core/common/websocket/base-ws-event';

export class ForumConversationCreatedEvent extends BaseWsEvent<ForumConversationCreated> {
  get eventName(): string {
    return 'forum.class.group.conversation.created';
  }
}

export class ForumConversationCreated {
  data:
    | {
        type: string;
        content: string;
      }
    | undefined;
}
