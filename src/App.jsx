import "regenerator-runtime";
import speech, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect, useState } from "react";
import { apiKey } from "./config";

function App() {
    const { listening, transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [thinking, setThinking] = useState(false);
    const [aiText, setAiText] = useState("");
    const [step, setStep] = useState(null); // Track conversation step
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");

    const systemMessage = `
        
    `;

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser doesn't support speech recognition.</p>;
    }

    // Trigger appropriate actions based on the transcript
    function triggerAction(transcript) {
        console.log("Transcript received:", transcript);

        if (transcript.toLowerCase().includes("book a test ride")) {
            setStep("waitingForMobile");
            callGpt3API("Please provide your mobile number");
        }
    }

    // Store mobile number and ask for email
    function storeMobileNumber(transcript) {
        transcript = transcript.replace(/\D/g, ''); 
        console.log("adeebKhan",transcript);
        const mobileRegex = /\b\d{10}\b/; // Match 10-digit mobile number
        const match = transcript.match(mobileRegex);
        console.log("Match", match)

        if (match) {
            const mobileNumber = match[0];
            setMobile(mobileNumber);
            localStorage.setItem("mobileNumber", mobileNumber);
            console.log("Mobile number saved:", mobileNumber);

            // Move to next step: Ask for email
            setStep("waitingForEmail");
            callGpt3API("Please provide your email address");
        } else {
            console.log("Invalid mobile number. Please provide a valid 10-digit number.");
        }
    }

    // Store email and trigger booking API
    function storeEmail(transcript) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const match = transcript.match(emailRegex);

        if (match) {
            const emailAddress = match[0];
            setEmail(emailAddress);
            localStorage.setItem("email", emailAddress);
            console.log("Email saved:", emailAddress);

            // Proceed to book the test ride
            bookTestRideAPI();
        } else {
            console.log("Invalid email. Please provide a valid email address.");
        }
    }

    // API call to book test ride
    function bookTestRideAPI() {
        const mobileNumber = localStorage.getItem("mobileNumber");
        const emailAddress = localStorage.getItem("email");

        if (mobileNumber && emailAddress) {
            console.log("Booking test ride with:", { mobile: mobileNumber, email: emailAddress });
            fetch("https://api.revoltmotors.com/test-ride", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mobile: mobileNumber, email: emailAddress }),
            })
                .then((response) => response.json())
                .then((data) => console.log("Booking response:", data))
                .catch((error) => console.error("Error booking test ride:", error));
        }
    }

    // Call GPT-3 API for voice responses
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
                const audioData = data.choices[0].message.audio;
                playAudioResponse(audioData.data);
                setAiText(data.choices[0]?.message?.audio?.transcript);
            } else {
                throw new Error("Audio content not available.");
            }
        } catch (error) {
            setThinking(false);
            console.error("Error calling GPT API:", error);
        }
    }

    // Play audio response
    function playAudioResponse(base64Data) {
        const binaryString = atob(base64Data);
        const binaryData = new Uint8Array([...binaryString].map((char) => char.charCodeAt(0)));
        const audioBlob = new Blob([binaryData], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }

    useEffect(() => {
        if (!listening && transcript) {
            if (step === "waitingForMobile") {
                storeMobileNumber(transcript);
            } else if (step === "waitingForEmail") {
                storeEmail(transcript);
            } else {
                // triggerAction(transcript);
                callGpt3API(transcript)
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
