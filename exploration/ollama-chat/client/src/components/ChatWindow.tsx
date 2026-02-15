import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { ChatMessage } from '../types';

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export default function ChatWindow({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-auto p-3">
      {messages.length === 0 && (
        <div className="flex align-items-center justify-content-center h-full text-500">
          <p>Send a message to start chatting with Ollama</p>
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          isStreaming={isStreaming && i === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
