"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../lib/utils";
import { vapi } from "../lib/vapi.sdk";
import { interviewer } from "../constants";
import { createFeedback } from "../lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  interviewId: string;
  feedbackId?: string | null;
  type: string;
  questions: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          userId,
          transcript: messages,
        }),
      });
      const data = await res.json();
      if (data.success && data.feedbackId) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        router.push('/');
      }
    };
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        if (messages.length === 0) {
          // User ended call early, no feedback
          router.push("/interviews");
        } else {
          handleGenerateFeedback(messages);
        }
      }
    }
  }, [messages, callStatus, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions.map((question) => `- ${question}`).join("\n");
      }
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        {/* AI Interviewer Card */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-64">
          <div className="mb-4">
            {/* Default SVG Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20c0-2.21 3.58-4 6-4s6 1.79 6 4" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-1">AI Interviewer</h3>
          {isSpeaking && <span className="text-xs text-green-500 animate-pulse">Speaking...</span>}
        </div>

        {/* User Profile Card */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-64">
          <div className="mb-4">
            {/* Default SVG Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20c0-2.21 3.58-4 6-4s6 1.79 6 4" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-1">{userName}</h3>
        </div>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div className="w-full max-w-xl bg-white rounded-xl shadow p-6 mb-8">
          <div className="text-gray-700 text-base">
            <p className="animate-fadeIn">{lastMessage}</p>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-primary-dark transition"
            onClick={handleCall}
          >
            {callStatus === "INACTIVE" || callStatus === "FINISHED" ? "Call" : ". . ."}
          </button>
        ) : (
          <button
            className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-red-600 transition"
            onClick={handleDisconnect}
          >
            End
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent; 