import { useEffect, useState } from "react";

let sharedSteps = 9990;

export default function useSimulatedSteps() {
  const [steps, setSteps] = useState(sharedSteps);

  useEffect(() => {
    let timeoutId;

    const simulateStepIncrease = () => {
      if (sharedSteps >= 13000) {
        sharedSteps = 13000;
        setSteps(sharedSteps);
        return;
      }

      const stepIncrement = Math.floor(Math.random() * 8) + 1;
      sharedSteps = Math.min(sharedSteps + stepIncrement, 13000);
      setSteps(sharedSteps);

      const delay = Math.floor(Math.random() * 8000) + 2000;
      timeoutId = setTimeout(simulateStepIncrease, delay);
    };

    simulateStepIncrease();

    return () => clearTimeout(timeoutId);
  }, []);

  // Add manual increment function
  const manuallyAddSteps = (amount) => {
    sharedSteps = Math.min(sharedSteps + amount, 13000);
    setSteps(sharedSteps);
  };

  return [steps, manuallyAddSteps]; // Return both state and function
}
