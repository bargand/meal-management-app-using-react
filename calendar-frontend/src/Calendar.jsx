import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Calendar.css';

function Calendar() {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    generateCalendarDays();
    fetchEntries();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInThisMonth = new Date(year, month + 1, 0).getDate();
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
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const dateStr = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    setSelectedDate(dateStr);
    setDescription(entries[dateStr] || "");
  };

  const handleSaveEntry = async () => {
    if (selectedDate && description) {
      await axios.post("http://localhost:5000/entry", { date: selectedDate, description });
      setEntries({ ...entries, [selectedDate]: description });
      setDescription("");
      alert("Entry saved!");
    }
  };

  return (
    <div>
      <h2>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h2>
      <div className="calendar">
        {daysInMonth.map((day) => (
          <div
            key={day}
            className={`calendar-day ${entries[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] ? 'has-entry' : ''}`}
            onClick={() => handleDateClick(day)}
          >
            {day}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="entry-form">
          <h3>Entry for {selectedDate}</h3>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <button onClick={handleSaveEntry}>Save Entry</button>
        </div>
      )}
    </div>
  );
}

export default Calendar;

//main code