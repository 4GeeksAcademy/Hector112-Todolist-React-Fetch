import React, { useState, useEffect } from "react";

const Fech = () => {
    const [inputValue, setInputValue] = useState('');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const username = "hector";

    // Obtener tareas al cargar
    useEffect(() => {
        fetchTasks();
    }, []);

    // Función para obtener tareas
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://playground.4geeks.com/todo/users/${username}`);
            const data = await response.json();
            if (Array.isArray(data.todos)) { setTasks(data.todos); }
        } catch (error) {
            console.error("Error:", error);
        } finally { setLoading(false); }
    };

    // Agregar NUEVA TAREA
    const addTask = async () => {
        if (inputValue.trim() === "") return;

        try {
            const response = await fetch(`https://playground.4geeks.com/todo/todos/${username}`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: inputValue.trim() })
            });
            if (response.ok) { await fetchTasks(); setInputValue(""); }
        } catch (error) { console.error("Error:", error); }
    };

    // ELIMINAR TAREA
    const deleteTask = async (taskId) => {
        try {
            const response = await fetch(`https://playground.4geeks.com/todo/todos/${taskId}`, {
                method: "DELETE"
            });
            if (response.ok) { await fetchTasks(); }
        } catch (error) { console.error("Error:", error); }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    };

    return (
        <div className="containerTodo text-center">
            <div className="contenedorLista d-flex row justify-content-center">
                <div className="col-8">
                    <h1 className="text-center my-4 text-danger opacity-25">todos</h1>

                    <div className="mb-3">
                        <input type="text" className="form-control todo-input text-center" placeholder="Añadir una nueva tarea"
                            value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown} disabled={loading} />
                    </div>

                    {loading ? (<div className="text-center my-4">Cargando</div>) : (
                        <div className="list-group">
                            {tasks.map((task) => (
                                <div key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span style={{ flexGrow: 1, textAlign: "left" }}> {task.label} </span>
                                    <button onClick={() => deleteTask(task.id)} className="btn btn-sm btn-outline-danger" disabled={loading}>
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-2 text-muted small">
                        {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"} en total
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Fech;
