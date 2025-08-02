import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// ✅ Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyDAlVzUeNuEYCnCWvg_v5rw80q9YXvysYc",
  authDomain: "discovery-gradhack25jnb-108.firebaseapp.com",
  projectId: "discovery-gradhack25jnb-108",
  storageBucket: "discovery-gradhack25jnb-108.firebasestorage.app",
  messagingSenderId: "1011454667050",
  appId: "1:1011454667050:web:230f3a6ca09b9c5907d653"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UniversityLineGraph = () => {
  const svgRef = useRef();
  const [eventData, setEventData] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [scannedEvents, setScannedEvents] = useState([]);

  const universities = [
    { name: "Wits", color: "#45314B", thickness: 3 },
    { name: "UP", color: "#B5AEB9", thickness: 3 },
    { name: "UCT", color: "#444B7F", thickness: 3 },
    { name: "SU", color: "#705378", thickness: 3 },
    { name: "NWU", color: "#06105C", thickness: 3 },
    { name: "UJ", color: "#D8D8D8", thickness: 3 },
  ];

  // Fetch all events from Firestore once
  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, "campus_event_data"));
      const data = querySnapshot.docs.map(doc => doc.data()).sort((a, b) => a.event - b.event);
      console.log("Firestore events fetched:", data);
      setAllEvents(data);
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    //if (allEvents.length > 0) {
      console.log("Setting eventData for initial graph:", allEvents);
     // setEventData(allEvents);
  //  }
  }, [allEvents]);

  // Redraw D3 graph whenever eventData changes
  useEffect(() => {
    if (eventData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 40, bottom: 40, left: 50 };

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([1, eventData.length])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(eventData.flatMap(d => universities.map(u => d[u.name]))) + 20])
      .range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(eventData.length).tickFormat(d => `Event ${d}`));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    const line = d3.line()
      .x((d) => x(d.event))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "6px 10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("font-size", "14px")
      .style("display", "none");

    universities.forEach(univ => {
      const univData = eventData.map(e => ({
        event: e.event,
        value: e[univ.name],
      }));

      svg.append("path")
        .datum(univData)
        .attr("fill", "none")
        .attr("stroke", univ.color)
        .attr("stroke-width", univ.thickness)
        .attr("d", line)
        .on("mouseover", () => {
          tooltip.style("display", "block").text(univ.name);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });


      svg.selectAll(`.dot-${univ.name}`)
        .data(univData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.event))
        .attr("cy", d => y(d.value))
        .attr("r", 4)
        .attr("fill", univ.color)
        //.transition()
        //.duration(800)
        //.attr("d", line)
        .on("mouseover", () => {
          tooltip.style("display", "block");
        })
        .on("mousemove", (event, d) => {
          tooltip
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 20 + "px")
            .text(`${univ.name}: ${d.value}`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });
    });
  }, [eventData]);

  // Simulate scanning a QR code
  const handleScan = (qrCode) => {
    console.log("Attempting to scan QR code:", qrCode);
    const scanned = allEvents.find(e => e.qrCode === qrCode);
    if (!scanned || scannedEvents.includes(qrCode)) return;

    console.log("QR code scanned successfully:", scanned);
    setEventData(prev => [...prev, scanned].sort((a, b) => a.event - b.event));
    setScannedEvents(prev => [...prev, qrCode]);
  };

return (
  <div style={{ marginTop: "1rem" }}>
    {/* Graph Section */}
    <div>
      <svg ref={svgRef}></svg>
    </div>

    {/* Simulate QR Scans Section */}
    <div style={{ 
      background: "#f9f9f9", 
      padding: "10px", 
      borderRadius: "5px", 
      marginTop: "2rem" // Add spacing below graph
    }}>
      <h3>Simulate QR Scans</h3>
      {allEvents.length === 0 && <p>Loading events...</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {allEvents.map(event => (
          <button
            key={event.qrCode}
            onClick={() => handleScan(event.qrCode)}
            disabled={scannedEvents.includes(event.qrCode)}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: scannedEvents.includes(event.qrCode) ? "not-allowed" : "pointer",
              backgroundColor: scannedEvents.includes(event.qrCode) ? "#e0e0e0" : "#ffffff",
              color: scannedEvents.includes(event.qrCode) ? "#888" : "#333",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "background-color 0.2s, box-shadow 0.2s"
            }}
          >
            Scan {event.name}
          </button>
        ))}
      </div>
    </div>
  </div>
);
}

export default UniversityLineGraph;
