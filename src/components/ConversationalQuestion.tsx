import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ConversationalQuestionProps {
  emoji: string;
  botMessage: string;
  questionType: "scale" | "yesno";
  onAnswer: (answer: string) => void;
  showTyping?: boolean;
}

export const ConversationalQuestion = ({
  emoji,
  botMessage,
  questionType,
  onAnswer,
  showTyping = false
}: ConversationalQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [showResponseArea, setShowResponseArea] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 500);
    const timer2 = setTimeout(() => setShowResponseArea(true), 1200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleAnswer = (value: string) => {
    setSelectedAnswer(value);
    setTimeout(() => onAnswer(value), 300);
  };

  const renderScaleOptions = () => (
    <div className="grid grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          onClick={() => handleAnswer(num.toString())}
          className={`scale-option ${selectedAnswer === num.toString() ? 'selected' : ''}`}
        >
          <span className="text-2xl mb-2">{num}</span>
          <span className="text-xs text-muted-foreground">
            {num === 1 ? "Not at all" : num === 5 ? "Very much" : ""}
          </span>
        </button>
      ))}
    </div>
  );

  const renderYesNoOptions = () => (
    <div className="flex gap-4">
      <button
        onClick={() => handleAnswer("yes")}
        className={`yes-no-option ${selectedAnswer === "yes" ? 'selected' : ''}`}
      >
        <div className="text-2xl mb-2">✅</div>
        <div>Yes</div>
      </button>
      <button
        onClick={() => handleAnswer("no")}
        className={`yes-no-option ${selectedAnswer === "no" ? 'selected' : ''}`}
      >
        <div className="text-2xl mb-2">❌</div>
        <div>No</div>
      </button>
    </div>
  );

  if (showTyping) {
    return (
      <div className="chat-container">
        <div className="w-full max-w-lg">
          <div className="bot-message">
            <div className="flex items-start space-x-3">
              <div className="text-3xl">{emoji}</div>
              <div className="flex-1">
                <div className="typing-indicator">
                  <span>Bot is thinking</span>
                  <div className="flex space-x-1 ml-2">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="w-full max-w-lg">
        {/* Bot Message */}
        {showContent && (
          <div className="bot-message">
            <div className="flex items-start space-x-3">
              <div className="text-3xl animate-bounceGentle">{emoji}</div>
              <div className="flex-1">
                <div className="text-base leading-relaxed text-foreground">
                  {botMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Response Area */}
        {showResponseArea && (
          <div className="user-response-area">
            <div className="text-sm text-muted-foreground mb-4 text-center">
              Your response:
            </div>
            {questionType === "scale" ? renderScaleOptions() : renderYesNoOptions()}
          </div>
        )}
      </div>
    </div>
  );
};