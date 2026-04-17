# 📊 Interactive Data Visualization: Surgical Procedures Analysis

![JavaScript](https://img.shields.io/badge/JavaScript-Used-yellow)
![D3.js](https://img.shields.io/badge/D3.js-Visualization-orange)
![HTML/CSS](https://img.shields.io/badge/Frontend-HTML%2FCSS-blue)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen)

---

## 📌 Overview
This project is an **interactive data visualization** built for DSC 106 (Data Visualization), exploring patterns in **surgical procedures and medical data** through dynamic, user-driven visualizations.

The goal is to transform complex healthcare data into **intuitive, interactive visual insights** that allow users to:
- Explore surgical case distributions  
- Understand procedure durations and frequencies  
- Analyze hierarchical relationships in medical data  

👉 **Live Demo:**  
https://nglyry.github.io/dsc106-proj3/ 

---

## 🎯 Objectives
- Build an **interactive visualization system** using D3.js  
- Enable users to explore healthcare data through multiple coordinated views  
- Communicate insights through **visual storytelling and interaction**  
- Apply best practices in **visual encoding, usability, and design**  

---

## 📊 Results at a Glance

- 📊 **Clear Distribution Patterns:** Surgical cases vary significantly by category and type  
- ⏱️ **Duration Variability:** Some procedures show high variability in time required  
- 🌳 **Hierarchical Insights:** Tree/zoomable visualizations reveal relationships between procedures  
- 🔄 **Interactive Exploration:** Users can dynamically filter and explore data across multiple views  
- 🎯 **Improved Interpretability:** Complex datasets become more accessible through visualization  

👉 This project demonstrates how **interactive visualizations can simplify complex medical data and support exploratory analysis**.

---

## 🔍 Key Features & Visualizations

### 📊 Bar Charts
- Compare frequencies of surgical procedures  
- Highlight differences across categories  

### 🦋 Butterfly Chart
- Compare distributions between groups  
- Enable side-by-side analysis  

### 🌳 Zoomable / Hierarchical Visualization
- Explore relationships in surgical procedure data  
- Interactive zooming for deeper insight  

### 📈 Multiple Coordinated Views
- Different charts connected through shared data  
- Enables richer exploration and comparison  

---

## 🗂️ Project Structure

```
dsc106-proj3/
├── data/                         # Raw and processed datasets (CSV, JSON)
├── r_data/                       # Additional cleaned/processed data
├── index.html                    # Main entry point
├── style.css                     # Styling
├── global.js                     # Shared logic across visualizations
│
├── barchart.js                   # Bar chart visualization
├── butterfly.js                  # Butterfly comparison chart
├── zoomable.js                   # Hierarchical / zoomable visualization
├── bar_rose.js                   # Additional custom visualization
│
├── *.csv / *.json                # Data files (surgical cases, durations, etc.)
└── README.md                     # Project documentation
```
---

## 🔍 Key Insights
- Interactive visualizations enable **deeper exploration than static charts**  
- Hierarchical views help uncover **hidden structure in complex datasets**  
- Comparing multiple visualizations improves **data interpretability**  
- User-driven interaction enhances **engagement and understanding**  
- Visual encoding plays a critical role in **communicating complex information effectively**  

---

## 🔮 Future Work
- Add interactive filters (dropdowns, sliders) for more user control  
- Incorporate larger and more diverse real-world datasets  
- Improve UI/UX design and responsiveness across devices  
- Deploy as a fully hosted interactive dashboard  
- Integrate advanced techniques (e.g., animations, transitions, linked brushing)  
