# Movement Pattern Simulator (2D Fencing Edition)

![Project Status](https://img.shields.io/badge/Status-Active-emerald) ![Tech Stack](https://img.shields.io/badge/Stack-React_TypeScript_Tailwind-blue)

A high-precision, interactive web application designed to simulate, track, and record spatial movement patterns on a 10m x 10m grid. Originally conceptualized for fencing analysis, this tool allows users to manipulate a 1m² unit, set target destinations, and export detailed kinematic data for analysis.

## 🌟 Key Features

### 🎮 Interactive Simulation
*   **10m x 10m Grid System:** A fully responsive SVG-based grid representing a physical space.
*   **Draggable Agent:** A 1m x 1m square (representing a fencer/agent) that can be moved freely or snapped to integer grid points.
*   **Target Mode:** Ability to place a "Target" ghost square to simulate drills (e.g., "Move from Point A to Point B").
*   **Corner Tracking:** Real-time calculation of all four corners of the agent (Top-Left, Top-Right, Bottom-Right, Bottom-Left) relative to the grid.

### ⏱️ Motion Tracking & Recording
*   **Time-Based Recording:** Capture movement paths with a built-in 10-second countdown timer.
*   **Precise Timestamping:** Records position data with millisecond precision (`timeOffset`).
*   **Visual Pathing:** Real-time rendering of the movement trail and visited coordinates on the grid.

### 📊 Data Analysis & Export
*   **Detailed History Modal:** View a step-by-step breakdown of the recorded session.
*   **Comprehensive JSON Export:** One-click copy functionality to export data for external analysis (Python, MATLAB, Excel).
*   **Calculated Metrics:** Automatically calculates total duration, Euclidean distance to target, and corner coordinates for every frame.

## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Build Tool:** Vite

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/movement-pattern-simulator.git
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in browser:**
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage Guide

### 1. Movement & Controls
*   **Move Mode:** Select "Move Square" in the header. Drag the **Blue Square** to position your starting point.
*   **Target Mode:** Select "Set Target" in the header. Click or drag to place the **Green Target** square.
*   **Snap Toggle:** Use the "Snap: OFF/ON" button to constrain movement to integer coordinates.

### 2. Recording a Session
1.  Click the **Start Record (10s)** button in the right-hand panel.
2.  The system will immediately start tracking coordinates.
3.  Perform your movement pattern on the grid.
4.  The recording stops automatically after 10 seconds, or manually if you click **Stop Recording**.

### 3. Exporting Data
1.  After recording, click **View Data List**.
2.  Review the summary (Start, Finish, Target, Duration).
3.  Click **Copy as JSON** to get the raw data object.

## 💾 Data Structure

The exported JSON structure is designed for granular analysis. It includes the absolute position of the object's anchor (Top-Left) and the calculated positions of all four corners for every recorded step.

```json
{
  "summary": {
    "startPosition": { "position": { "x": 2, "y": 2 }, "corners": [...] },
    "endPosition": { "position": { "x": 5, "y": 5 }, "corners": [...] },
    "targetPosition": { "x": 8, "y": 8 },
    "durationSeconds": 4.52,
    "totalSteps": 120
  },
  "recordingHistory": [
    {
      "step": 1,
      "timeOffset": 0.0,
      "position": { "x": 2.0, "y": 2.0 },
      "corners": [
        { "id": "A", "name": "Top-Left", "x": 2.0, "y": 2.0 },
        { "id": "B", "name": "Top-Right", "x": 3.0, "y": 2.0 },
        { "id": "C", "name": "Bottom-Right", "x": 3.0, "y": 3.0 },
        { "id": "D", "name": "Bottom-Left", "x": 2.0, "y": 3.0 }
      ]
    },
    // ... subsequent steps
  ]
}
```

## 🧩 Component Architecture

*   **`GridMap`**: Handles the SVG rendering, drag logic, coordinate transformation, and visual path drawing.
*   **`InfoPanel`**: Displays real-time stats, distance to target, and specific corner coordinates.
*   **`PathModal`**: Handles the post-session analysis view and JSON formatting logic.
*   **`App`**: Manages global state (recording status, timer, shared coordinates).
