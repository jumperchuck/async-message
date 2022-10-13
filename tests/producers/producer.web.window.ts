import { producer } from 'async-message';
import { WindowChannel } from 'async-message/web';
import { callbackSerializer } from 'async-message/serializer';
import { target } from './target';

const channel = new WindowChannel();
channel.registerSerializer(callbackSerializer);

producer(channel, target);
