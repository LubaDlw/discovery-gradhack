import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import mockEventData from "../data/mockEventData";

const UniversityLineGraph = ({ activeEvent }) => {
    const svgRef = useRef();
    const [eventData, setEventData] = useState([]);
  
    const universities = [
      { name: "Wits", color: "#45314B", thickness: 3 },
      { name: "UP",   color: "#B5AEB9", thickness: 3 },
      { name: "UCT",  color: "#444B7F", thickness: 3 },
      { name: "SU", color: "#705378", thickness: 3 },
      { name: "NWU",   color: "#06105C", thickness: 3 },
      { name: "UJ",  color: "#D8D8D8", thickness: 3 },
    ];
  
    useEffect(() => {
      setTimeout(() => {
        setEventData(mockEventData);
      }, 1000);
    }, []);
  
    useEffect(() => {
      if (eventData.length === 0) return;
  
      const filteredData = (() => {
        if (!activeEvent) return eventData;
      
        // Calculate next event (wrap around)
        const nextEvent = activeEvent === 8 ? 1 : activeEvent + 1;
      
        // Filter only two events: activeEvent and nextEvent
        return eventData.filter(d => d.event === activeEvent || d.event === nextEvent);
      })();
      
  
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
  
      const width = 600;
      const height = 300;
      const margin = { top: 20, right: 40, bottom: 40, left: 50 };
  
      svg.attr("width", width).attr("height", height);
  
        const eventNumbers = filteredData.map(d => d.event);
        const minEvent = d3.min(eventNumbers);
        const maxEvent = d3.max(eventNumbers);

        const x = d3
        .scaleLinear()
        .domain([minEvent, maxEvent])
        .range([margin.left, width - margin.right]);
  
      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(filteredData.flatMap(d =>
            universities.map(u => d[u.name])
          )) + 20
        ])
        .range([height - margin.bottom, margin.top]);
  
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
            d3.axisBottom(x)
              .ticks(2)
              .tickFormat(d => `Event ${d}`)
          );
          
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      const line = d3.line()
        .x(d => x(d.event))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);
  
      const tooltip = d3.select("body").append("div")
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
        const univData = filteredData.map(e => ({
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
          .on("mouseover", () => tooltip.style("display", "block"))
          .on("mousemove", (event, d) => {
            tooltip
              .style("left", event.pageX + 15 + "px")
              .style("top", event.pageY - 20 + "px")
              .text(`${univ.name}: ${d.value}`);
          })
          .on("mouseout", () => tooltip.style("display", "none"));
      });
    }, [eventData, activeEvent]);
  
    return <svg ref={svgRef}></svg>;
  };
  
  export default UniversityLineGraph;
  