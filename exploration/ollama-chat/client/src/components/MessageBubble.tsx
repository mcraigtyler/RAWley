import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { ChatMessage } from '../types';

interface Props {
  message: ChatMessage;
  isStreaming: boolean;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <Card
        className={`max-w-30rem ${isUser ? 'bg-primary' : 'surface-card'}`}
        pt={{ body: { className: 'p-2' }, content: { className: 'p-0' } }}
      >
        <div className="text-sm font-semibold mb-1 text-500">
          {isUser ? 'You' : 'Assistant'}
        </div>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
          {isStreaming && !message.content && (
            <div className="flex align-items-center gap-2">
              <ProgressSpinner
                style={{ width: '20px', height: '20px' }}
                strokeWidth="4"
              />
              <span className="text-500">Thinking...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
