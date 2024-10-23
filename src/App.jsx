import "regenerator-runtime";
import speech, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect, useState } from "react";
import { apiKey } from "./config";



function App() {

    const { listening, transcript } = useSpeechRecognition();
    const [thinking, setThinking] = useState(false);
    const [aiText, setAiText] = useState("");

    async function callGpt3API(message) {
        setThinking(true);
        const data = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "Respond with a polite Indian conversational tone. Use words like 'please,' 'sir,' and 'thank you.' Keep the tone friendly."
                    },
                    {
                        role: "user",
                        content: message,
                    }
                ],
                model: "gpt-4o",
            }),
        }).then((res) => res.json());
        console.log("adeebkhan", data);
        setThinking(false);
        return data.choices[0].message.content;
    };

    useEffect(() => {
        if (!listening && transcript) {
            callGpt3API(transcript).then((response) => {
                const speechSynthesis = window.speechSynthesis;
                const utterance = new SpeechSynthesisUtterance(response);
                speechSynthesis.speak(utterance);
                setAiText(response);
            });
        }
    }, [transcript, listening])
    return (
        <>
            {
                listening ? (<p>Go ahead I'm listening...</p>) : (<p>Click the button and ask me anything</p>)
            }
            <button onClick={() => {
                speech.startListening();
            }}>Ask me anything...</button>
            {transcript && <div>{transcript}</div>}
            {thinking && <div>Thinking...</div>}
            {aiText && <div>{aiText}</div>}
        </>
    )
};


export default App;