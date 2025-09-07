import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    if (token) {
      const fetchTasks = async () => {
        try {
          const res = await axios.get("http://localhost:3000/tasks", {
            headers: { Authorization: token }
          });
          setTasks(res.data);
        } catch (err) {
          console.error("Error fetching tasks:", err.message);
        }
      };
      fetchTasks();
    }
  }, [token]); // ✅ no more ESLint warning

  const addTask = async () => {
    if (!text.trim()) return;
    await axios.post("http://localhost:3000/tasks", { text }, {
      headers: { Authorization: token }
    });
    setText("");
    // refresh tasks after adding
    const res = await axios.get("http://localhost:3000/tasks", {
      headers: { Authorization: token }
    });
    setTasks(res.data);
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:3000/tasks/${id}`, {
      headers: { Authorization: token }
    });
    // refresh tasks after delete
    const res = await axios.get("http://localhost:3000/tasks", {
      headers: { Authorization: token }
    });
    setTasks(res.data);
  };

  const signup = async () => {
    await axios.post("http://localhost:3000/signup", { username, password });
    alert("Signup successful! Now log in.");
  };

  const login = async () => {
    const res = await axios.post("http://localhost:3000/login", { username, password });
    setToken(res.data.token);
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>🔐 Login / Signup</h1>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <button onClick={signup}>Signup</button>
          <button onClick={login}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>✅ MERN To-Do (with Auth)</h1>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={addTask}>Add</button>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li key={task._id}>
            {task.text}{" "}
            <button onClick={() => deleteTask(task._id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
