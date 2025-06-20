import React, { useState, useEffect } from 'react';

const API_BASE = "https://playground.4geeks.com/todo"; // Nota el cambio en la URL base
const USERNAME = "hector"; // Cambia esto por tu nombre de usuario real

function Lista() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const createUserIfNotExists = async () => {
  try {
    const response = await fetch(`${API_BASE}/users/${USERNAME}`);
    if (response.status === 404) {
      const creation = await fetch(`${API_BASE}/users/${USERNAME}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify([]) // se requiere un array vacío
      });

      if (!creation.ok && creation.status !== 400) {
        throw new Error(`Error al crear usuario: ${creation.status}`);
      }
    }
  } catch (err) {
    throw new Error("Fallo al verificar o crear el usuario");
  }
};


  // Cargar tareas al iniciar
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users/${USERNAME}`, {
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          await initializeUser();
          return;
        }
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }
      
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/${USERNAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify([])
      });
      
      if (![200, 201, 400].includes(response.status)) {
  throw new Error("Error al inicializar usuario");
}

      
      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveTasks = async (updatedTasks) => {
  try {
    await createUserIfNotExists(); // crea el usuario si falta

    const response = await fetch(`${API_BASE}/users/${USERNAME}`, {
      method: "PUT", // ✅ ahora es PUT
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(updatedTasks) // ✅ ahora sí es válido
    });

    if (!response.ok) {
      throw new Error(`Error al guardar: ${response.status}`);
    }
  } catch (err) {
    setError(err.message);
  }
};


  const handleAddTask = async (e) => {
    if (e.key === 'Enter') {
      const text = inputText.trim();
      if (text) {
        try {
          setLoading(true);
          const newTask = { 
            label: text,
            is_done: false 
          };
          
          const updatedTasks = [...tasks, newTask];
          await saveTasks(updatedTasks);
          setTasks(updatedTasks);
          setInputText("");
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const deleteTask = async (index) => {
    try {
      setLoading(true);
      const updatedTasks = tasks.filter((_, i) => i !== index);
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (index) => {
    try {
      setLoading(true);
      const updatedTasks = [...tasks];
      updatedTasks[index] = {
        ...updatedTasks[index],
        is_done: !updatedTasks[index].is_done
      };
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-5 text-danger">
        Error: {error}
        <button onClick={fetchTasks} className="btn btn-sm btn-secondary ms-2">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="text-center text-primary mb-4">Lista de Tareas</h1>
              
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Añade una nueva tarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleAddTask}
                  disabled={loading}
                />
              </div>

              {tasks.length === 0 ? (
                <p className="text-center text-muted">No hay tareas. ¡Añade una!</p>
              ) : (
                <ul className="list-group">
                  {tasks.map((task, index) => (
                    <li 
                      key={index}
                      className={`list-group-item d-flex justify-content-between align-items-center ${
                        task.is_done ? 'list-group-item-light' : ''
                      }`}
                    >
                      <span
                        onClick={() => toggleComplete(index)}
                        style={{
                          textDecoration: task.is_done ? 'line-through' : 'none',
                          cursor: 'pointer',
                          flexGrow: 1
                        }}
                      >
                        {task.label}
                      </span>
                      
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteTask(index)}
                        disabled={loading}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {tasks.length > 0 && (
                <div className="mt-3 text-end text-muted">
                  {tasks.filter(t => !t.is_done).length} tareas pendientes
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lista;