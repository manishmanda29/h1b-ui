import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CompanyBasedPetitions = ({ data }) => {
  // Add petition totals to each data point
  data.forEach(d => {
    d.totalPetitions = d.InitialApproval + d.InitialDenial + d.ContinuingApproval + d.ContinuingDenial;
  });

  // Sort the companies by total petitions in descending order
  data.sort((a, b) => b.totalPetitions - a.totalPetitions);

  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 40, right: 30, bottom: 100, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous SVG content before rendering new chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up the SVG canvas
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (category scale for employer names)
    const x = d3.scaleBand()
      .domain(data.map(d => d.EmployerName))
      .range([0, width])
      .padding(0.2);

    // Y scale (linear scale for petition counts)
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.totalPetitions)])
      .nice()
      .range([height, 0]);

    // Append the bars to represent total petitions
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.EmployerName))
      .attr('y', d => y(d.totalPetitions))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.totalPetitions))
      .attr('fill', '#4a90e2');

    // Add X axis (company names)
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Add Y axis (petition counts)
    svg.append('g')
      .call(d3.axisLeft(y))
      .style('font-size', '12px');

    // Add petition count labels on top of bars
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.EmployerName) + x.bandwidth() / 2)
      .attr('y', d => y(d.totalPetitions) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.totalPetitions)
      .style('font-size', '12px')
      .style('fill', '#333');
  }, [data]);

  return (
    <div>
      <h1>Top Companies Based on Number of Petitions Filed</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default CompanyBasedPetitions;
