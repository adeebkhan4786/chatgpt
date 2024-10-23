import "regenerator-runtime";
import speech, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect, useState } from "react";
import { apiKey } from "./config";

function App() {
    const { listening, transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [thinking, setThinking] = useState(false);
    const [aiText, setAiText] = useState("");

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser doesn't support speech recognition.</p>;
    }

    async function callGpt3API(message) {
        setThinking(true);
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-audio-preview",
                    modalities: ["text", "audio"],
                    messages: [
                        { role: "system", content: "Respond in a polite Indian tone." },
                        { role: "user", content: message },
                    ],
                    audio: {
                        // voice: "alloy",              // Use Alloy voice (if supported)
                        voice: "shimmer", 
                        format: "wav",               // Output format
                        // parameters: {
                        //     temperature: 0.8,         // Adjust response randomness
                        //     prefix_padding: 300,      // Padding before audio starts
                        //     threshold: 0.5,           // Quality threshold
                        // },
                    },
                }),
            });

           
            setThinking(false);
            const rawResponse = await response.text(); // Raw response for logging
            const data = JSON.parse(rawResponse); // Parse JSON
            // console.log("adeeb",data)

            if (!response.ok) {
                console.error("API Error:", data);
                throw new Error(data.error?.message || "Unknown API error");
            }
            
            if (data.choices && data.choices[0]?.message?.audio?.data) {
                console.log("AudioData");
                return data.choices[0].message.audio;
            } else {
                console.warn("Audio content missing:", data);
                throw new Error("Audio content not available or invalid.");
            }
        } catch (error) {
            setThinking(false);
            console.error("Error calling GPT API:", error);
            throw error;
        }
    }

    useEffect(() => {
        if (!listening && transcript) {
            callGpt3API(transcript)
                .then((audioData) => {
                    try {
                        // console.log(audioData)
                        const base64Regex = /^[A-Za-z0-9+/=]+$/;
                        if (!base64Regex.test(audioData.data)) {
                            throw new Error("Invalid base64 string.");
                        }

                        // Decode the base64 audio data safely
                        const binaryString = atob(audioData.data);
                        const binaryData = new Uint8Array(
                            [...binaryString].map((char) => char.charCodeAt(0))
                        );
                        const audioBlob = new Blob([binaryData], { type: "audio/wav" });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const audio = new Audio(audioUrl);
                        audio.play(); // Play the generated audio response
                        setAiText(audioData.transcript); // Display the spoken input
                    } catch (decodeError) {
                        console.error("Error decoding audio:", decodeError);
                    }
                })
                .catch((err) => console.error("API call or playback error:", err));
        }
    }, [transcript, listening]);

    return (
        <>
            {listening ? (
                <p>Go ahead, I'm listening...</p>
            ) : (
                <p>Click the button and ask me anything</p>
            )}
            <button onClick={() => speech.startListening()}>Ask me anything...</button>
            {transcript && <div>{transcript}</div>}
            {thinking && <div>Thinking...</div>}
            {aiText && <div>{aiText}</div>}
        </>
    );
}

export default App;
