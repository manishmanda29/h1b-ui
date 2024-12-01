import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EmployerVisualization = ({ data }) => {
  const svgRef = useRef();

  // Aggregate and sort the raw data to get the top 10 employers based on total petitions filed.
  const aggregateData = (rawData) => {
    const groupedData = {};

    rawData.forEach((row) => {
      const {
        EmployerName,
        InitialApproval,
        InitialDenial,
        ContinuingApproval,
        ContinuingDenial,
      } = row;

      // Convert to numbers
      const initialApproval = +InitialApproval || 0;
      const initialDenial = +InitialDenial || 0;
      const continuingApproval = +ContinuingApproval || 0;
      const continuingDenial = +ContinuingDenial || 0;

      if (!groupedData[EmployerName]) {
        groupedData[EmployerName] = {
          InitialApproval: 0,
          InitialDenial: 0,
          ContinuingApproval: 0,
          ContinuingDenial: 0,
        };
      }

      groupedData[EmployerName].InitialApproval += initialApproval;
      groupedData[EmployerName].InitialDenial += initialDenial;
      groupedData[EmployerName].ContinuingApproval += continuingApproval;
      groupedData[EmployerName].ContinuingDenial += continuingDenial;
    });

    // Convert the object into an array, add total petitions, and sort by it
    return Object.entries(groupedData)
      .map(([employer, values]) => ({
        employer,
        totalPetitions:
          values.InitialApproval +
          values.InitialDenial +
          values.ContinuingApproval +
          values.ContinuingDenial,
        ...values,
      }))
      .sort((a, b) => b.totalPetitions - a.totalPetitions)
      .slice(0, 10); // Get top 10 employers
  };

  useEffect(() => {
    if (!data) return;

    const aggregatedData = aggregateData(data);
    console.log('Aggregated Data:', aggregatedData);

    // Set up SVG dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 50, right: 30, bottom: 120, left: 60 };

    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Define keys for the stacked data
    const keys = ['InitialApproval', 'InitialDenial', 'ContinuingApproval', 'ContinuingDenial'];

    // Define color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#69b3a2', '#ff6f61', '#ffc107', '#ff3d00']);

    // Define scales
    const xScale = d3
      .scaleBand()
      .domain(aggregatedData.map((d) => d.employer))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(aggregatedData, (d) => d.totalPetitions)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Draw axes
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(d3.axisLeft(yScale));

    // Stack data
    const stackedData = d3.stack().keys(keys)(aggregatedData);
    const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', 'rgba(0, 0, 0, 0.7)')
    .style('color', 'white')
    .style('padding', '5px')
    .style('border-radius', '3px')
    .style('font-size', '12px');

    // Draw bars
    svg
      .selectAll('g.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', (d) => colorScale(d.key))
      .selectAll('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.data.employer))
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .on('mouseover', function (event, d) {
        console.log(event)
        d3.select(this).attr('opacity', 0.7);
        const tooltip = d3.select('.tooltip');
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d.data.employer}</strong><br>
            Initial Approval: ${d.data.InitialApproval}<br>
            Initial Denial: ${d.data.InitialDenial}<br>
            Continuing Approval: ${d.data.ContinuingApproval}<br>
            Continuing Denial: ${d.data.ContinuingDenial}<br>
            Total Petitions: ${d.data.totalPetitions}`
          )
          .style('left', `${event.screenX}px`)
          .style('top', `${event.screenY}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1);
        d3.select('.tooltip').style('opacity', 0);
      });

    // Add legend
    const legend = svg
      .selectAll('.legend')
      .data(keys)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${width - margin.right - 150}, ${margin.top + i * 20})`);

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', colorScale);

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 14)
      .text((d) => d);
  }, [data]);

  return (
    <>
      <svg ref={svgRef} width={800} height={500}></svg>
      <div
        className="tooltip"
        style={{
          position: 'absolute',
          opacity: 0,
          background: '#fff',
          padding: '5px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          pointerEvents: 'none',
        }}
      ></div>
    </>
  );
};

export default EmployerVisualization;
