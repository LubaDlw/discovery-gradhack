import { useEffect, useState } from "react";

let sharedSteps = 11264;

export default function useSimulatedSteps() {
  const [steps, setSteps] = useState(sharedSteps);

  useEffect(() => {
    let timeoutId;

    const simulateStepIncrease = () => {
      // Random step increment between 1 and 8
      const stepIncrement = Math.floor(Math.random() * 8) + 1;

      sharedSteps += stepIncrement;
      setSteps(sharedSteps);

      // Random delay between 2 and 8 seconds
      const delay = Math.floor(Math.random() * 10000) + 2000;

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

