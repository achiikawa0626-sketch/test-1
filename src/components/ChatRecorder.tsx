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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    return () => {
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!recording || isPaused) return undefined;

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPaused, recording]);

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
      setElapsedSeconds(0);
      setIsPaused(false);
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
    setIsPaused(false);
    setElapsedSeconds(0);
  }

  function cancelRecording() {
    const recorder = recorderRef.current;
    if (!recorder || !recording) return;

    recorder.onstop = () => {
      recorder.stream.getTracks().forEach((track) => track.stop());
    };
    recognitionRef.current?.stop();
    if (recorder.state !== 'inactive') recorder.stop();
    chunksRef.current = [];
    setRecording(undefined);
    setIsPaused(false);
    setElapsedSeconds(0);
    setMessage('');
  }

  function togglePause() {
    const recorder = recorderRef.current;
    if (!recorder || !recording) return;

    if (recorder.state === 'recording') {
      recorder.pause();
      recognitionRef.current?.stop();
      setIsPaused(true);
      return;
    }

    if (recorder.state === 'paused') {
      recorder.resume();
      startTranscription();
      setIsPaused(false);
    }
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
        <div className="chat-recording-bar">
          <button
            className="chat-recording-delete"
            type="button"
            onClick={cancelRecording}
            disabled={isSending}
            aria-label={text.skipButton}
          >
            ×
          </button>
          <span className="chat-recording-time">{formatElapsed(elapsedSeconds)}</span>
          <div className="chat-recording-wave" aria-hidden="true">
            {waveBars.map((height, index) => (
              <span key={`${height}-${index}`} style={{ height }} />
            ))}
          </div>
          <button
            className="chat-recording-pause"
            type="button"
            onClick={togglePause}
            disabled={isSending}
            aria-label={isPaused ? text.recordVoiceTitle : text.skipButton}
          >
            {isPaused ? '>' : '||'}
          </button>
          <button
            className="chat-recording-send"
            type="button"
            onClick={() => void stopAndSend()}
            disabled={isSending}
            aria-label={text.sendButton}
          >
            {isSending ? '...' : '>'}
          </button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

const waveBars = [8, 12, 16, 11, 18, 22, 14, 19, 10, 16, 21, 13, 18, 12, 20, 15, 9, 17, 22, 13];

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
