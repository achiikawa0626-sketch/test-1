import { useRef, useState } from 'react';
import type { ChatMediaType } from '../lib/chat';

type ChatRecorderProps = {
  allowedTypes: ChatMediaType[];
  onSend: (blob: Blob, mediaType: ChatMediaType) => Promise<void>;
};

export function ChatRecorder({ allowedTypes, onSend }: ChatRecorderProps) {
  const recorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState<ChatMediaType>();
  const [message, setMessage] = useState('');

  async function start(mediaType: ChatMediaType) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mediaType === 'video',
      });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = () => stopTracks(stream);
      recorder.start();
      setRecording(mediaType);
      setMessage(`${mediaType === 'audio' ? 'Voice' : 'Video'} recording started.`);
    } catch {
      setMessage('Recording permission was blocked.');
    }
  }

  async function stopAndSend() {
    const recorder = recorderRef.current;
    if (!recorder || !recording) return;
    const mediaType = recording;

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: `${mediaType}/webm` });
      await onSend(blob, mediaType);
      setMessage(`${mediaType === 'audio' ? 'Voice' : 'Video'} answer sent.`);
    };
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
          disabled={Boolean(recording)}
          title="Record voice"
        >
          Mic
        </button>
      )}
      {allowedTypes.includes('video') && (
        <button
          className="chat-icon-button"
          type="button"
          onClick={() => void start('video')}
          disabled={Boolean(recording)}
          title="Record video"
        >
          Camera
        </button>
      )}
      {recording && (
        <button className="chat-send-recording" type="button" onClick={() => void stopAndSend()}>
          Send {recording}
        </button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

function stopTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}
