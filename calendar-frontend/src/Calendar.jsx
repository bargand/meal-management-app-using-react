import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Calendar.css';

function Calendar() {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [description, setDescription] = useState("");
  const [saveMessage, setSaveMessage] = useState(""); // New state for save message

  useEffect(() => {
    generateCalendarDays();
    fetchEntries();
  }, [selectedMonth, selectedYear]);

  const generateCalendarDays = () => {
    const daysInThisMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    setDaysInMonth([...Array(daysInThisMonth).keys()].map(day => day + 1));
  };

  const fetchEntries = async () => {
    const response = await axios.get("http://localhost:5000/entries");
    const entriesMap = response.data.reduce((acc, entry) => {
      acc[entry.date] = entry.description;
      return acc;
    }, {});
    setEntries(entriesMap);
  };

  const handleDateClick = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedDay(day);
    setDescription(entries[dateStr] || "");
  };

  const handleSaveEntry = async () => {
    if (selectedDate && description) {
      await axios.post("http://localhost:5000/entry", { date: selectedDate, description });
      setEntries({ ...entries, [selectedDate]: description });
      setDescription("");

      // Show save message and clear it after 3 seconds
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

  return (
    <div className="calendar-container">
      <h2>{new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>

      <div className="selector-container">
        <label>
          Month
          <select value={selectedMonth} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </label>
        <label>
          Year
          <input type="number" value={selectedYear} onChange={handleYearChange} min="2000" max="2100" />
        </label>
      </div>

      <div className="calendar">
        {daysInMonth.map((day) => {
          const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return (
            <div
              key={day}
              className={`calendar-day 
                ${entries[dateStr] ? 'saved' : ''} 
                ${selectedDay === day ? 'selected' : ''}`}
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
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <button onClick={handleSaveEntry}>Save Entry</button>
        </div>
      )}

      {/* Popup notification for save message */}
      {saveMessage && (
        <div className="save-message">
          {saveMessage}
        </div>
      )}
    </div>
  );
}

export default Calendar;

//main code