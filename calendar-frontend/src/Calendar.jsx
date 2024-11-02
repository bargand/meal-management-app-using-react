import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Calendar.css";

function Calendar() {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [lunchDescription, setLunchDescription] = useState("");
  const [dinnerDescription, setDinnerDescription] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Monthly balance
  const monthlyBalance = 30;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    generateCalendarDays();
    fetchEntries();
  }, [selectedMonth, selectedYear]);

  const generateCalendarDays = () => {
    const daysInThisMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();
    setDaysInMonth([...Array(daysInThisMonth).keys()].map((day) => day + 1));
  };

  const fetchEntries = async () => {
    const response = await axios.get("http://localhost:5000/entries");
    const entriesMap = response.data.reduce((acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    }, {});
    setEntries(entriesMap);
  };

  const handleDateClick = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedDay(day);

    // Set descriptions and consumed status based on entries
    if (entries[dateStr]) {
      setLunchDescription(entries[dateStr].lunch?.description || "");
      setDinnerDescription(entries[dateStr].dinner?.description || "");
    } else {
      setLunchDescription("");
      setDinnerDescription("");
    }
  };

  const handleSaveEntry = async () => {
    if (selectedDate) {
      const newEntry = {
        date: selectedDate,
        lunch: { description: lunchDescription, consumed: !!lunchDescription },
        dinner: {
          description: dinnerDescription,
          consumed: !!dinnerDescription,
        },
      };
      await axios.post("http://localhost:5000/entry", newEntry);

      // Update the entries state to reflect the saved data
      setEntries((prevEntries) => ({
        ...prevEntries,
        [selectedDate]: newEntry,
      }));

      setLunchDescription("");
      setDinnerDescription("");

      setSaveMessage("Data is saved");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
    setSelectedDay(null);
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
    setSelectedDay(null);
  };

  // Calculate daily cost for lunch and dinner based on days in month
  const calculateDailyCost = () => {
    const daysInThisMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();
    return monthlyBalance / daysInThisMonth;
  };

  const calculateRemainingBalance = () => {
    const entriesForMonth = Object.values(entries).filter((entry) => {
      const [year, month] = entry.date.split("-");
      return (
        parseInt(year) === selectedYear && parseInt(month) === selectedMonth + 1
      );
    });

    const dailyCost = calculateDailyCost() / 1; // Assuming lunch and dinner each cost half of daily cost
    const amountDeducted = entriesForMonth.reduce((total, entry) => {
      const lunchCost = entry.lunch.consumed ? dailyCost : 0;
      const dinnerCost = entry.dinner.consumed ? dailyCost : 0;
      return total + lunchCost + dinnerCost;
    }, 0);

    return monthlyBalance - amountDeducted;
  };

  return (
    <div className="calendar-container">
      <h2>
        {new Date(selectedYear, selectedMonth).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </h2>

      <div className="selector-container">
        <label>
          Month
          <select value={selectedMonth} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <input
            type="number"
            value={selectedYear}
            onChange={handleYearChange}
            min="2000"
            max="2100"
          />
        </label>
      </div>

      <div className="balance-info">
        <p>
          <strong>Starting Balance:</strong> ₹{monthlyBalance}
        </p>
        <p>
          <strong>Per Meal Cost:</strong> ₹{calculateDailyCost().toFixed(2)}
        </p>
        <p>
          <strong>Remaining Balance:</strong> ₹
          {calculateRemainingBalance().toFixed(2)}
        </p>
      </div>

      <div className="calendar">
        {daysInMonth.map((day) => {
          const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const hasEntry =
            entries[dateStr] &&
            (entries[dateStr].lunch.consumed ||
              entries[dateStr].dinner.consumed);

          return (
            <div
              key={day}
              className={`calendar-day 
                ${hasEntry ? "saved" : ""} 
                ${selectedDay === day ? "selected" : ""} 
                ${isToday ? "today" : ""}`}
              onClick={() => handleDateClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="entry-form">
          <h3>Entry for {selectedDate}</h3>

          <label>Lunch:</label>
          <input
            type="text"
            value={lunchDescription}
            onChange={(e) => setLunchDescription(e.target.value)}
            placeholder="Describe lunch"
          />

          <label>Dinner:</label>
          <input
            type="text"
            value={dinnerDescription}
            onChange={(e) => setDinnerDescription(e.target.value)}
            placeholder="Describe dinner"
          />

          <button onClick={handleSaveEntry}>Save Entry</button>
          {saveMessage && (
            <div className="save-message">
              <span className="icon">✔️</span>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendar;

//main code
