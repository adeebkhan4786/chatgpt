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
    };


    // Function to handle different actions based on the transcript or AI response
    // function handleActions(responseText) {
    //     if (responseText.includes("book test ride")) {
    //         window.open("https://www.revoltmotors.com/test-ride", "_blank");
    //     } else if (responseText.includes("book the bike")) {
    //         window.open("https://www.revoltmotors.com/book", "_blank");
    //     } else if (responseText.includes("play music")) {
    //         alert("Playing music... 🎵");
    //         // Implement music playback logic here
    //     } else {
    //         console.log("No matching action found.");
    //     }
    // }






    // Detect keywords in transcript and trigger actions
    function triggerAction(transcript) {
        console.log("Transcript received:", transcript);

        if (transcript.toLowerCase().includes("booking a test ride") || transcript.toLowerCase().includes("book a test ride") || transcript.toLowerCase().includes("test ride link") || transcript.toLowerCase().includes("book test ride")){
            console.log("success")
            window.open("https://www.revoltmotors.com/test-ride", "_blank");
        } else if (transcript.toLowerCase().includes("book bike")) {
            window.open("https://www.revoltmotors.com/book", "_blank");
        } else if (transcript.toLowerCase().includes("contact support")) {
            alert("Calling support at +91-98 7305 0505...");
        } else {
            console.log("No specific action triggered.");
        }
    }



    // function triggerAction(aiText) {
    //     console.log("Transcript received:", aiText);

    //     if (aiText.toLowerCase().includes("book test ride")) {
    //         window.open("https://www.revoltmotors.com/test-ride", "_blank");
    //     } else if (aiText.toLowerCase().includes("book bike")) {
    //         window.open("https://www.revoltmotors.com/book", "_blank");
    //     } else if (aiText.toLowerCase().includes("contact support")) {
    //         alert("Calling support at +91-98 7305 0505...");
    //     } else {
    //         console.log("No specific action triggered.");
    //     }
    // }

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
                        {
                            role: "system", content: `                          
You are Rev, a friendly chatbot bot assistant for Revolt Motors. Your job is provide conversational assistance and all the information about Revolt Motors to its customers.  Customers can book test ride by using URL https://www.revoltmotors.com/test-ride or they can book the bike using URL https://www.revoltmotors.com/book . You need to provide all the information related to Revolt motors only and nothing else. All the required information about Revolt motors can be found on its website. https://www.revoltmotors.com 
 Thank you for providing this information about Revolt Motors. I'll summarize the key points:
 1. Ownership: Revolt Motors is now a wholly owned subsidiary of RattanIndia Enterprises, which completed a 100% acquisition of the company.
 2. Leadership:
   - Ms. Anjali Rattan: Chairperson of RattanIndia Enterprises Limited
   - Mr. Rajiv Rattan: Chairman of RattanIndia Group
   - Mr. Jayant Khosla: CEO of RattanIndia Enterprises
 3. Company details:
   - Founded: 2017
   - Industry: Automotive (specifically electric vehicles)
   - Type: Private company
   - Headquarters: Gurgaon, Haryana, India
 4. Mission and Vision:
   - Mission: "To create a future of next-gen mobility with 100% accessibility and 0% fuel residue."
   - Vision: "Democratising clean commute using next-gen mobility solutions"
 5. Contact information:
   - Email: contact@revoltmotors.com
   - Helpline: +91-98 7305 0505 (Mon-Sun, 10 AM-7 PM)
   - For job openings: Career@revoltmotors.com
 
6. Policies:
   - Bookings can be cancelled within 90 days of the booking date by contacting Revolt dealers.
   - Refunds are processed according to company policy.
 7. Revolt Mobile App. Troubleshooting steps:
 1: "User not found" error: Occurs when trying to log in with an unregistered mobile number.
 2: "Resource not found" alert: Indicates an ECU (Engine Control Unit) malfunction. Users should visit a Revolt Service Centre.
 3: OTP not received: Often due to poor network connection. Contact customer care if persistent.
4: Bluetooth connection issues: 
•	May be due to denied permissions, GPS issues, ECU problems, or the bike being connected to another device.
•	Solutions vary based on the specific cause.
 5: GPS not working: Could be due to antenna issues or poor connectivity. Visit a Revolt hub if persistent.
 6: Distance discrepancy between app and speedometer: Due to data sync frequency (every 20 seconds) and GPS connection quality.
 7: Battery status discrepancy: Likely due to outdated data. Contact customer care for assistance.
 8: Sound box issues: Visit a Revolt Service Centre if unable to connect or change sounds.
 9: Key functionality (e.g., Exa-locate): Won't work when the bike's ignition is on.
 10: Swipe to start/stop not working: 
•	For bikes purchased before Feb 2023: Requires a hardware upgrade.
•	For bikes purchased after Feb 2023: Visit the nearest service centre if not working.
 8. Revolt Bike Pricing Information: 
Pricing Details of Different Models:
 
Model RV1:
 Ex-showroom Introductory price: INR 94,990/-
PM E-Drive Subsidy: INR 10,000/-
Effective price: INR 84,990 + State Subsidy (as applicable and to be claimed by customer) *
 
Model RV1+:
 Ex-showroom Introductory price: INR 1,09,990/-
PM E-Drive Subsidy: INR 10,000/-
Effective price: INR 99,990 + State Subsidy (as applicable and to be claimed by customer) *
 
Model RV 400 BRZ:
 Ex-showroom price: INR 1,42,950/-
PM E-Drive Subsidy: INR 10,000/-
Cash Discount: INR 5000/-
Effective price: INR 1,27,950 + State Subsidy (as applicable and to be claimed by customer) *
Other offers (applicable for limited period):
Free Insurance: INR 7000/-
Exchange Bonus: INR 2500/-
 
Model RV 400:
 Ex-showroom price: INR 1,49,950/-
PM E-Drive Subsidy: INR 10,000/-
Cash Discount: INR 3000/- (applicable on limited stock) *
Effective price: INR 1,36,950 + State Subsidy (as applicable and to be claimed by customer) *

   ` },
                        { role: "user", content: message },
                    ],
                    audio: {
                        voice: "alloy",
                        format: "wav", 
                        // parameters: {
                        //     temperature: 0.8,         // Adjust response randomness
                        //     prefix_padding: 300,      // Padding before audio starts
                        //     threshold: 0.5,           // Quality threshold
                        // },
                    },
                }),
            });


            setThinking(false);
            const rawResponse = await response.text();
            const data = JSON.parse(rawResponse);
            console.log("Data", data)

            if (!response.ok) {
                console.error("API Error:", data);
                throw new Error(data.error?.message || "Unknown API error");
            }

            if (data.choices && data.choices[0]?.message?.audio?.data) {
                console.log("AudioData");
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
