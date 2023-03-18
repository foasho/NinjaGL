import { useEffect, useRef, useState } from "react";

interface ISpeechRecognitionEvent {
  isTrusted?: boolean;
  resultIndex: number;
  results: {
    isFinal: boolean;
    [key: number]:
    | undefined
    | {
      transcript: string;
    };
  }[];
}

interface ISpeechRecognition extends EventTarget {
  // properties
  grammars: string;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI: string;

  // event handlers
  onaudiostart: () => void;
  onaudioend: () => void;
  onend: () => void;
  onerror: () => void;
  onnomatch: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onsoundstart: () => void;
  onsoundend: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
  onstart: () => void;

  // methods
  abort(): void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: any | { webkitSpeechRecognition: any };
  }
}
declare var webkitSpeechRecognition: any;

interface IUseSpeechRecognition {
  enabled: boolean;
  lang: "ja" | "en";
  continuous: boolean; // 連続的に音声認識
  interimResults: boolean; // 途中結果の出力
}

interface ISpeechRecognitionResult {
  finishText: string;
  interimText: string;
}

/**
 * 音声認識ReactHook
 * @param props 
 * @returns 
 */
export const useSpeechRecognition = (props: IUseSpeechRecognition): ISpeechRecognitionResult => {
  const ref = useRef<ISpeechRecognitionResult>({
    finishText: '',
    interimText: ''
  });
  const [text, setText] = useState<string>();
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  var recognition: ISpeechRecognition = new webkitSpeechRecognition();
  recognition.lang = props.lang;
  recognition.interimResults = props.interimResults;
  recognition.continuous = props.continuous;

  recognition.onresult = (event: ISpeechRecognitionEvent) => {
    if (props.enabled) {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          ref.current.finishText = finalTranscript;
        } else {
          interimTranscript += transcript;
          ref.current.interimText = interimTranscript;
        }
      }
    }
    else {
      ref.current.interimText = "";
      ref.current.finishText = "";
    }
  };

  const startRecognition = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        recognition.start();
      })
      .catch(error => {
        console.error(error);
      });
  }

  const stopRecognition = () => {
    recognition.stop();
  };

  useEffect(() => {
    if (props.enabled) {
      startRecognition();
    }
    else {
      stopRecognition();
    }
  }, [props.enabled]);

  return ref.current;
}