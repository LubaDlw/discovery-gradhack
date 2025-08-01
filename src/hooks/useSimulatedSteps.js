import { useEffect, useState } from "react";

let sharedSteps = 1264;        // Persistent shared state
let lastTimestamp = Date.now(); // Track last update time

export default function useSimulatedSteps() {
  const [steps, setSteps] = useState(sharedSteps);

  useEffect(() => {
    const updateSteps = () => {
      const now = Date.now();
      const secondsPassed = Math.floor((now - lastTimestamp) / 2000);
      if (secondsPassed >= 1) {
        sharedSteps += secondsPassed;
        lastTimestamp = now;
        setSteps(sharedSteps);
      }
    };

    const intervalId = setInterval(() => {
      updateSteps();
    }, 1000); // check every 1s to see if 2s have passed

    return () => {
      clearInterval(intervalId); // stop counting when user navigates away
    };
  }, []);

  useEffect(() => {
    // Always sync the latest sharedSteps into local state when component loads
    setSteps(sharedSteps);
  }, []);

  return steps;
}

