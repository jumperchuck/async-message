import { producer } from 'async-message';
import { WorkerChannel } from 'async-message/web';
import { callbackSerializer } from 'async-message/serializer';
import { target } from './target';

const channel = new WorkerChannel();
channel.registerSerializer(callbackSerializer);

producer(channel, target);
