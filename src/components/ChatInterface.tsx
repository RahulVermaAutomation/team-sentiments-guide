import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  type?: "text" | "question" | "response";
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  showResponseOptions?: boolean;
  responseOptions?: {
    type: "scale" | "yesno" | "continue" | "consent";
    onResponse: (response: string) => void;
  };
  userName?: string;
}

export const ChatInterface = ({
  messages,
  onSendMessage,
  isTyping = false,
  showResponseOptions = false,
  responseOptions,
  userName = "User"
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedResponse, setSelectedResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResponseSelect = (response: string) => {
    setSelectedResponse(response);
    if (responseOptions?.onResponse) {
      setTimeout(() => {
        responseOptions.onResponse(response);
        setSelectedResponse("");
      }, 300);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderScaleOptions = () => (
    <div className="scale-options">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          onClick={() => handleResponseSelect(num.toString())}
          className={`scale-option ${selectedResponse === num.toString() ? 'selected' : ''}`}
        >
          <div className="text-xl mb-1">{num}</div>
          <div className="text-xs opacity-75">
            {num === 1 ? "Not at all" : num === 5 ? "Very much" : ""}
          </div>
        </button>
      ))}
    </div>
  );

  const renderConsentOptions = () => (
    <div className="consent-options">
      <button
        onClick={() => handleResponseSelect("agree-full")}
        className={`consent-option ${selectedResponse === "agree-full" ? 'selected' : ''}`}
      >
        <div className="text-2xl mb-2">✅</div>
        <div className="font-medium">I Agree and Consent</div>
        <div className="text-xs opacity-75 mt-1">Full participation with data collection</div>
      </button>
      <button
        onClick={() => handleResponseSelect("agree-anonymous")}
        className={`consent-option ${selectedResponse === "agree-anonymous" ? 'selected' : ''}`}
      >
        <div className="text-2xl mb-2">🔒</div>
        <div className="font-medium">I Agree as Anonymous</div>
        <div className="text-xs opacity-75 mt-1">Anonymous participation without personal data</div>
      </button>
      <button
        onClick={() => handleResponseSelect("decline")}
        className={`consent-option ${selectedResponse === "decline" ? 'selected' : ''}`}
      >
        <div className="text-2xl mb-2">❌</div>
        <div className="font-medium">I don't wish to proceed at this time</div>
        <div className="text-xs opacity-75 mt-1">End the session</div>
      </button>
    </div>
  );

  const renderYesNoOptions = () => (
    <div className="yesno-options">
      <button
        onClick={() => handleResponseSelect("yes")}
        className={`yesno-option ${selectedResponse === "yes" ? 'selected' : ''}`}
      >
        <div className="text-2xl mb-2">✅</div>
        <div>Yes</div>
      </button>
      <button
        onClick={() => handleResponseSelect("no")}
        className={`yesno-option ${selectedResponse === "no" ? 'selected' : ''}`}
      >
        <div className="text-2xl mb-2">❌</div>
        <div>No</div>
      </button>
    </div>
  );

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="assistant-avatar">🤖</div>
          <div className="chat-header-info">
            <h2>PS Wellness Assistant</h2>
            <div className="chat-header-status">
              <div className="status-indicator"></div>
              Online • Secure Chat
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Settings</Button>
          <Button variant="ghost" size="sm">Help</Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === "assistant" ? "ai-message" : "user-message"}`}
          >
            <div className={`message-avatar ${message.role === "assistant" ? "ai-avatar" : "user-avatar"}`}>
              {message.role === "assistant" ? "🤖" : "👤"}
            </div>
            <div className={`message-bubble ${message.role === "assistant" ? "ai-bubble" : "user-bubble"}`}>
              <div className="message-content">
                {message.content.split("\n\n").map((para, idx) => (
                  <p key={idx} className="message-content mb-3 last:mb-0">{para}</p>
                ))}
              </div>
              <div className="message-timestamp">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="message ai-message">
            <div className="message-avatar ai-avatar">🤖</div>
            <div className="message-bubble ai-bubble">
              <div className="typing-indicator">
                <span>Assistant is typing</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Response Options */}
        {showResponseOptions && responseOptions && (
          <div className="response-options">
            <div className="text-sm text-muted-foreground mb-3 text-center">
              Please select your response:
            </div>
            {responseOptions.type === "scale" ? renderScaleOptions() : 
             responseOptions.type === "yesno" ? renderYesNoOptions() :
             responseOptions.type === "consent" ? renderConsentOptions() : null}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      {!showResponseOptions && (
        <div className="chat-input-area">
          <div className="chat-input-container">
            <button className="input-action-btn voice-btn" title="Voice message">
              🎤
            </button>
            <textarea
              className="chat-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className="input-action-btn send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};