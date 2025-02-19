import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function radial_plot() {
    let isPlaying = false;
    let animationInterval;
    const ANIMATION_SPEED = 1; // milliseconds between updates

    const width = 800, height = 800, margin = 60;
    const files = ["Data/S1/Final/HR.csv", "Data/S2/Final/HR.csv", "Data/S3/Final/HR.csv", "Data/S4/Final/HR.csv", "Data/S5/Final/HR.csv", "Data/S6/Final/HR.csv", "Data/S7/Final/HR.csv", "Data/S8/Final/HR.csv", "Data/S9/Final/HR.csv", "Data/S10/Final/HR.csv"];
    const studentLabels = ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5", "Student 6", "Student 7", "Student 8", "Student 9", "Student 10"];

    const heartPosition = d3.select(".fa-heart")
        .style("position", "absolute")
        .style("top", "50%")
        .style("left", "50%")
        .style("transform", "translate(-50%, -50%)")
        .style("z-index", "1000");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const svg = d3.select(".container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const hoverPoints = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll(".hover-point")
        .data(studentLabels)
        .enter().append("circle")
        .attr("class", "hover-point")
        .attr("r", 5)
        .style("opacity", 1)  // Make points visible
        .style("pointer-events", "all");

    const meanHRText = svg.append("text")
        .attr("class", "mean-heart-rate")
        .attr("x", width / 2)
        .attr("y", height / 2 + 45) // Adjust this value to position below the heart
        .text("Mean HR: 0 BPM");
    
    const rawDataArray = await Promise.all(files.map(file => d3.text(file)));
    const datasets = rawDataArray.map(rawData => {
        const lines = rawData.split('\n');
        return {
            initialTime: parseInt(lines[0]),
            sampleRate: parseFloat(lines[1]),
            hrValues: lines.slice(2)
                .filter(line => line.trim() !== "")
                .map(parseFloat) //only valid strings are parsed 
        };
    });

    const first = datasets[0];
    if (!datasets.every(d => d.initialTime === first.initialTime && d.sampleRate === first.sampleRate)) {
        throw new Error("Different start times or sample rates");
    }

    // Define the start and end times in seconds since the epoch
    const startTime = new Date(first.initialTime * 1000);
    startTime.setHours(8, 40, 0, 0);
    const endTime = new Date(first.initialTime * 1000);
    endTime.setHours(12, 20, 0, 0);

    const startSeconds = startTime.getTime() / 1000;
    const endSeconds = endTime.getTime() / 1000;

    // Filter the data based on the time range
    const filteredDatasets = datasets.map(dataset => {
        const filteredHrValues = dataset.hrValues.filter((_, i) => {
            const currentTime = dataset.initialTime + i / dataset.sampleRate;
            return currentTime >= startSeconds && currentTime <= endSeconds;
        });
        return {
            ...dataset,
            hrValues: filteredHrValues
        };
    });

    const minLength = Math.min(...filteredDatasets.map(d => d.hrValues.length));

    const maxBPM = d3.max(filteredDatasets, d => d3.max(d.hrValues));
    const radiusScale = d3.scaleLinear()
        .domain([0, maxBPM]) 
        .range([0, width / 2 - margin]); 

    const angleScale = d3.scaleLinear()
        .domain([0, filteredDatasets.length])
        .range([0, 2 * Math.PI]);

    const lineGenerator = d3.lineRadial()
        .angle((d, i) => angleScale(i))
        .radius(d => radiusScale(d))
        .curve(d3.curveLinearClosed); 

    const path = svg.append("path")
        .datum(filteredDatasets.map(d => d.hrValues[0]).concat(filteredDatasets[0].hrValues[0])) // Close the loop
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "#e41a1c")
        .attr("stroke-width", 2)
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const axisCircles = [50, 100, 150]; 

    const axis = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    axis.selectAll("circle")
        .data(axisCircles)
        .enter().append("circle")
        .attr("r", d => radiusScale(d))
        .attr("fill", "none")
        .attr("stroke", "#ccc");

    axis.selectAll(".axis-label")
        .data(axisCircles)
        .enter().append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("y", d => -radiusScale(d))
        .text(d => `${d} BPM`);

    // Add labels for each student
    svg.selectAll(".student-label")
        .data(studentLabels)
        .enter().append("text")
        .attr("class", "student-label")
        .attr("x", (d, i) => width / 2 + (width / 2 - margin - 5) * Math.cos(angleScale(i) - Math.PI / 2)) 
        .attr("y", (d, i) => height / 2 + (width / 2 - margin - 5) * Math.sin(angleScale(i) - Math.PI / 2)) 
        .attr("text-anchor", "middle")
        .text(d => d);

    d3.select("#timeSlider").attr("max", minLength - 1).on("input", function() {
        if (isPlaying) {
            togglePlay(); // Stop animation if user manually moves slider
        }
        const index = +this.value;
        updateRadialPlot(index);
        updateTimeDisplay(index);
        updateMeanHeartRate(index);
    });

    // Add play button functionality
    const playButton = d3.select("#playButton")
        .on("click", togglePlay);

    function togglePlay() {
        isPlaying = !isPlaying;
        playButton.text(isPlaying ? "Pause" : "Play");
        
        if (isPlaying) {
            animationInterval = setInterval(() => {
                const slider = d3.select("#timeSlider");
                let currentValue = +slider.property("value");
                const maxValue = +slider.property("max");
                
                if (currentValue >= maxValue) {
                    currentValue = 0;
                } else {
                    currentValue++;
                }
                
                slider.property("value", currentValue);
                updateRadialPlot(currentValue);
                updateTimeDisplay(currentValue);
                updateMeanHeartRate(currentValue);
            }, ANIMATION_SPEED);
        } else {
            clearInterval(animationInterval);
        }
    }

    function updateRadialPlot(index) {
        const updatedData = filteredDatasets.map(d => d.hrValues[index]).concat(filteredDatasets[0].hrValues[index]); 
        path.datum(updatedData)
            .attr("d", lineGenerator);
        
        // Update hover points positions
        hoverPoints
            .attr("cx", (d, i) => radiusScale(filteredDatasets[i].hrValues[index]) * Math.cos(angleScale(i) - Math.PI / 2))
            .attr("cy", (d, i) => radiusScale(filteredDatasets[i].hrValues[index]) * Math.sin(angleScale(i) - Math.PI / 2))
            .on("mouseover", function(event, d) {
                const pointIndex = studentLabels.indexOf(d);
                const heartRate = filteredDatasets[pointIndex].hrValues[index];
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d}<br/>Heart Rate: ${heartRate.toFixed(2)} BPM`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    function updateTimeDisplay(index) {
        const timeInSeconds = startSeconds + index; 
        const date = new Date(timeInSeconds * 1000);
        const formattedTime = d3.timeFormat("%H:%M:%S")(date);
        d3.select("#timeDisplay").text(`TIME: ${formattedTime}`);
    }
    
    // appends text to show the mean heart rate of the datasets in the middle of plot
    function updateMeanHeartRate(index) {
        const meanHR = d3.mean(filteredDatasets.map(d => d.hrValues[index]));
        meanHRText.text(`Mean HR: ${meanHR.toFixed(2)} BPM`);
        updateHeartbeat(meanHR); // Update heartbeat with mean heart rate
    }
}

radial_plot();

function updateHeartbeat(meanHR) {
    const duration = 10 / meanHR; 
    document.documentElement.style.setProperty('--beat-duration', `${duration}s`);
}

