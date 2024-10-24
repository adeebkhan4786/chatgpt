import "regenerator-runtime";
import speech, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect, useState } from "react";
import { apiKey } from "./config";

function App() {
    const { listening, transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [thinking, setThinking] = useState(false);
    const [aiText, setAiText] = useState("");
    const [waitingForMobile, setWaitingForMobile] = useState(false); // New state
    const [systemMessage, setSystemMessage] = useState("")

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser doesn't support speech recognition.</p>;
    }

    // Detect keywords in transcript and trigger actions
    function triggerAction(transcript) {
        console.log("Transcript received:", transcript);

        if (transcript.toLowerCase().includes("booking a test ride") || transcript.toLowerCase().includes("book a test ride") || transcript.toLowerCase().includes("test ride link") || transcript.toLowerCase().includes("book test ride")){
            setWaitingForMobile(true); 
            console.log("For booking a test ride, please provide your mobile number.");
        } else if (transcript.toLowerCase().includes("book bike")) {
            window.open("https://www.revoltmotors.com/book", "_blank");
        } else if (transcript.toLowerCase().includes("contact support")) {
            alert("Calling support at +91-98 7305 0505...");
        } else {
            console.log("No specific action triggered.");
        }
    }

    // Store mobile number in localStorage if waiting for it
    function storeMobileNumber(transcript) {
        const mobileRegex = /\b\d{10}\b/; // Regex to match a 10-digit mobile number
        const match = transcript.match(mobileRegex);

        if (match) {
            localStorage.setItem("mobileNumber", match[0]); // Store in localStorage
            console.log("Mobile number saved:", match[0]);
            setWaitingForMobile(false); // Reset the state
        } else {
            console.log("Please provide a valid 10-digit mobile number.");
        }
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
                        { role: "system", content: systemMessage },
                        { role: "user", content: message },
                    ],
                    audio: { voice: "alloy", format: "wav" },
                }),
            });

            setThinking(false);
            const data = await response.json();
            console.log("API Response:", data);

            if (data.choices && data.choices[0]?.message?.audio?.data) {
                triggerAction(data.choices[0]?.message?.audio?.transcript);
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
            if (waitingForMobile) {
                storeMobileNumber(transcript); // Store mobile number if waiting
            } else {
                callGpt3API(transcript)
                    .then((audioData) => {
                        try {
                            const binaryString = atob(audioData.data);
                            const binaryData = new Uint8Array([...binaryString].map((char) => char.charCodeAt(0)));
                            const audioBlob = new Blob([binaryData], { type: "audio/wav" });
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const audio = new Audio(audioUrl);
                            audio.play(); // Play the audio response
                            setAiText(audioData.transcript); // Display the spoken input
                        } catch (decodeError) {
                            console.error("Error decoding audio:", decodeError);
                        }
                    })
                    .catch((err) => console.error("API call or playback error:", err));
            }
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
