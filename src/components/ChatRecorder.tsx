import { useEffect, useRef, useState } from 'react';
import type { ChatMediaType } from '../lib/chat';
import type { HomeTranslation } from '../lib/homeTranslations';

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type ChatRecorderProps = {
  allowedTypes: ChatMediaType[];
  isSending: boolean;
  text: HomeTranslation;
  onSend: (blob: Blob, mediaType: ChatMediaType, transcript?: string) => Promise<void>;
};

export function ChatRecorder({ allowedTypes, isSending, text, onSend }: ChatRecorderProps) {
  const recorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike>();
  const transcriptRef = useRef('');
  const [recording, setRecording] = useState<ChatMediaType>();
  const [message, setMessage] = useState('');

  useEffect(() => {
    return () => {
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
    };
  }, []);

  function startTranscription() {
    const recognition = createSpeechRecognition();
    recognitionRef.current = recognition;
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    recognition.onresult = (event) => {
      const transcriptParts: string[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal || index >= event.resultIndex) {
          transcriptParts.push(result[0].transcript);
        }
      }
      transcriptRef.current = transcriptParts.join(' ').trim();
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = undefined;
    }
  }

  async function start(mediaType: ChatMediaType) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mediaType === 'video',
      });
      chunksRef.current = [];
      transcriptRef.current = '';
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = () => stopTracks(stream);
      startTranscription();
      recorder.start();
      setRecording(mediaType);
      setMessage(mediaType === 'audio' ? text.voiceRecordingStarted : text.videoRecordingStarted);
    } catch {
      setMessage(text.recordingBlocked);
    }
  }

  async function stopAndSend() {
    const recorder = recorderRef.current;
    if (!recorder || !recording || isSending) return;
    const mediaType = recording;

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: `${mediaType}/webm` });
      await onSend(blob, mediaType, transcriptRef.current.trim());
      setMessage(mediaType === 'audio' ? text.voiceAnswerSent : text.videoAnswerSent);
    };
    recognitionRef.current?.stop();
    recorder.stop();
    recorder.stream.getTracks().forEach((track) => track.stop());
    setRecording(undefined);
  }

  return (
    <div className="chat-recorder">
      {allowedTypes.includes('audio') && (
        <button
          className="chat-icon-button"
          type="button"
          onClick={() => void start('audio')}
          disabled={Boolean(recording) || isSending}
          title={text.recordVoiceTitle}
        >
          {text.micButton}
        </button>
      )}
      {allowedTypes.includes('video') && (
        <button
          className="chat-icon-button"
          type="button"
          onClick={() => void start('video')}
          disabled={Boolean(recording) || isSending}
          title={text.recordVideoTitle}
        >
          {text.cameraButton}
        </button>
      )}
      {recording && (
        <button
          className="chat-send-recording"
          type="button"
          onClick={() => void stopAndSend()}
          disabled={isSending}
        >
          {isSending ? text.sendingLabel : text.sendRecording(recording)}
        </button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

function stopTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

function createSpeechRecognition() {
  const speechWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  return Recognition ? new Recognition() : undefined;
}
