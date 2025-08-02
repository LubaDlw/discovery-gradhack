import { useEffect, useState } from "react";

let sharedSteps = 9990;

export default function useSimulatedSteps() {
  const [steps, setSteps] = useState(sharedSteps);

  useEffect(() => {
    let timeoutId;

    const simulateStepIncrease = () => {
      // Only simulate if not reached 13,000
      if (sharedSteps >= 13000) {
        sharedSteps = 13000;
        setSteps(sharedSteps);
        return; // Stop the loop
      }

      const stepIncrement = Math.floor(Math.random() * 8) + 1;
      sharedSteps = Math.min(sharedSteps + stepIncrement, 13000); // Clamp to 13,000
      setSteps(sharedSteps);

      const delay = Math.floor(Math.random() * 8000) + 2000;
      timeoutId = setTimeout(simulateStepIncrease, delay);
    };

    simulateStepIncrease(); // Start simulation

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setSteps(sharedSteps);
  }, []);

  return steps;
}
