import { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import type { ChatMessage, OllamaModel } from './types';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then((data: OllamaModel[]) => {
        setModels(data);
        if (data.length > 0) setSelectedModel(data[0].name);
      })
      .catch(console.error);
  }, []);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: updatedMessages,
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const chunk = JSON.parse(data);
            if (chunk.error) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: `Error: ${chunk.error}`,
                };
                return updated;
              });
              setIsStreaming(false);
              return;
            }
            if (chunk.message?.content) {
              fullContent += chunk.message.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: fullContent,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Error: Failed to get response from Ollama.',
        };
        return updated;
      });
    }

    setIsStreaming(false);
  };

  const handleClear = () => setMessages([]);

  return (
    <div className="flex flex-column h-screen">
      <Toolbar
        start={<h2 style={{ margin: 0 }}>Ollama Chat</h2>}
        end={
          <div className="flex align-items-center gap-2">
            <Dropdown
              value={selectedModel}
              options={models.map(m => ({ label: m.name, value: m.name }))}
              onChange={e => setSelectedModel(e.value)}
              placeholder="Select Model"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              outlined
              onClick={handleClear}
              tooltip="Clear conversation"
            />
          </div>
        }
      />
      <ChatWindow messages={messages} isStreaming={isStreaming} />
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}

export default App;
