import React, { useState } from 'react';
import './App.css';

const App = () => {
    const [registers, setRegisters] = useState({
        A: 0x00, B: 0x00, C: 0x00, D: 0x00, E: 0x00, H: 0x00, L: 0x00
    });

    const [flags, setFlags] = useState({
        zero: 0, carry: 0, sign: 0, parity: 0
    });

    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [gptPrompt, setGptPrompt] = useState('');
    const [gptResponse, setGptResponse] = useState('');

    // Simulated GPT response (replace with actual API call if needed)
    const getGptResponse = (prompt) => {
        return `Simulated GPT Response for: "${prompt}"`;
    };

    // Handle GPT prompt submission
    const handlePromptSubmit = () => {
        const response = getGptResponse(gptPrompt);
        setGptResponse(response);
    };

    const hexToDecimal = (hex) => parseInt(hex, 16);

    const updateFlags = (value) => {
        const newFlags = { ...flags };

        newFlags.zero = value === 0 ? 1 : 0;
        newFlags.sign = (value & 0x80) ? 1 : 0;
        const numOnes = value.toString(2).split('1').length - 1;
        newFlags.parity = (numOnes % 2 === 0) ? 1 : 0;

        return newFlags;
    };

    const resetRegistersAndFlags = () => {
        setRegisters({
            A: 0x00, B: 0x00, C: 0x00, D: 0x00, E: 0x00, H: 0x00, L: 0x00
        });
        setFlags({
            zero: 0, carry: 0, sign: 0, parity: 0
        });
    };

    const runCode = () => {
        let newOutput = '';
        const codeLines = code.split('\n').map(line => line.split(';')[0].trim()).filter(line => line);
        let updatedRegisters = { ...registers };
        let updatedFlags = { ...flags };

        codeLines.forEach((instructionLine, index) => {
            // MVI A, data
            const mviA = instructionLine.match(/^MVI A,\s*([0-9A-Fa-f]{2})H$/);
            if (mviA) {
                updatedRegisters.A = hexToDecimal(mviA[1]);
                updatedFlags = updateFlags(updatedRegisters.A);
                newOutput += `Step ${index + 1}: Load ${mviA[1]} into A. A = ${updatedRegisters.A.toString(16).toUpperCase()}\n`;
                return;
            }

            // MVI B, data
            const mviB = instructionLine.match(/^MVI B,\s*([0-9A-Fa-f]{2})H$/);
            if (mviB) {
                updatedRegisters.B = hexToDecimal(mviB[1]);
                updatedFlags = updateFlags(updatedRegisters.B);
                newOutput += `Step ${index + 1}: Load ${mviB[1]} into B. B = ${updatedRegisters.B.toString(16).toUpperCase()}\n`;
                return;
            }

            // ADD B (A = A + B)
            if (instructionLine.trim() === 'ADD B') {
                updatedRegisters.A += updatedRegisters.B;
                if (updatedRegisters.A > 0xFF) {
                    updatedRegisters.A &= 0xFF;
                    updatedFlags.carry = 1;
                } else {
                    updatedFlags.carry = 0;
                }
                updatedFlags = updateFlags(updatedRegisters.A);
                newOutput += `Step ${index + 1}: A = A + B = ${updatedRegisters.A.toString(16).toUpperCase()}\n`;
                return;
            }

            // SUB B (A = A - B)
            if (instructionLine.trim() === 'SUB B') {
                updatedRegisters.A -= updatedRegisters.B;
                if (updatedRegisters.A < 0) {
                    updatedRegisters.A &= 0xFF;
                    updatedFlags.carry = 1;
                } else {
                    updatedFlags.carry = 0;
                }
                updatedFlags = updateFlags(updatedRegisters.A);
                newOutput += `Step ${index + 1}: A = A - B = ${updatedRegisters.A.toString(16).toUpperCase()}\n`;
                return;
            }

            // MUL B (A = A * B)
            if (instructionLine.trim() === 'MUL B') {
                updatedRegisters.A *= updatedRegisters.B;
                if (updatedRegisters.A > 0xFF) {
                    updatedRegisters.A &= 0xFF; // Limit to 8 bits
                    updatedFlags.carry = 1;
                } else {
                    updatedFlags.carry = 0;
                }
                updatedFlags = updateFlags(updatedRegisters.A);
                newOutput += `Step ${index + 1}: A = A * B = ${updatedRegisters.A.toString(16).toUpperCase()}\n`;
                return;
            }

            // DIV B (A = A / B)
            if (instructionLine.trim() === 'DIV B') {
                if (updatedRegisters.B === 0) {
                    newOutput += `Step ${index + 1}: Error: Division by zero\n`;
                } else {
                    updatedRegisters.A = Math.floor(updatedRegisters.A / updatedRegisters.B);
                    updatedFlags.carry = 0; // No carry in division
                    updatedFlags = updateFlags(updatedRegisters.A);
                    newOutput += `Step ${index + 1}: A = A / B = ${updatedRegisters.A.toString(16).toUpperCase()}\n`;
                }
                return;
            }

            newOutput += `Error: Unknown instruction "${instructionLine}" on step ${index + 1}\n`;
        });

        setRegisters(updatedRegisters);
        setFlags(updatedFlags);
        setOutput(newOutput);
    };

    return (
        <div className="App">
            <h1>8085 Microprocessor Emulator</h1>
            <div className="container">
                <div className="column">
                    <textarea
                        id="code"
                        rows="10"
                        placeholder="Enter assembly instructions..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <button onClick={() => {
                        resetRegistersAndFlags();
                        runCode();
                    }}>Run Code</button>

                    <h2>Registers</h2>
                    <div className="registers">
                        {Object.keys(registers).map((reg) => (
                            <button key={reg} className="register-btn">
                                {reg}: <span>{registers[reg].toString(16).padStart(2, '0').toUpperCase()}</span>
                            </button>
                        ))}
                    </div>

                    <h2>Flags</h2>
                    <div className="flags">
                        <button className="flag-btn">Zero: <span>{flags.zero}</span></button>
                        <button className="flag-btn">Carry: <span>{flags.carry}</span></button>
                        <button className="flag-btn">Sign: <span>{flags.sign}</span></button>
                        <button className="flag-btn">Parity: <span>{flags.parity}</span></button>
                    </div>
                </div>

                <div className="column">
                    <h2>Output</h2>
                    <pre id="stepByStep">{output}</pre>
                </div>

                <div className="column">
                    <h2>GPT Prompt</h2>
                    <textarea
                        id="gptPrompt"
                        rows="4"
                        placeholder="Enter prompt..."
                        value={gptPrompt}
                        onChange={(e) => setGptPrompt(e.target.value)}
                    />
                    <button onClick={handlePromptSubmit}>Get GPT Response</button>

                    <h2>GPT Response</h2>
                    <pre id="gptResponse">{gptResponse}</pre>
                </div>
            </div>
        </div>
    );
};

export default App;
