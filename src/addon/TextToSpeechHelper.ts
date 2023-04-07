
interface ITextToSpeech {
  text: string;
  lang: "en-US" | "ja-JP"; // ISO 639-1コードの形式
  speed?: number; // 範囲: 0.1 ~ 10
  pitch?: number; // 範囲: 0.1 ~ 10
  volume?: number; // 範囲: 0 ~ 1
  voiceName?: string; // 使用する音声の種類
}

/**
 * 特定の文字をしゃべらせる
 * @param props 
 */
export const playTextToSpeech = (props: ITextToSpeech) => {
  const utterance = new SpeechSynthesisUtterance(props.text);
  utterance.rate = props.speed? props.speed: 1;
  if (props.voiceName){
    if (
      speechSynthesis.getVoices().find(
        (voice) => voice.name === props.voiceName)
    ){
      utterance.voice = speechSynthesis.getVoices().find(
        (voice) => voice.name === props.voiceName
      )
    }
  }
  utterance.pitch = (props.pitch)? props.pitch: 1;
  utterance.volume = (props.volume)? props.volume: 1;
  speechSynthesis.speak(utterance);
}