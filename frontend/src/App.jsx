import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");

  // Obtener tareas
  const fetchTasks = () => {
    fetch("http://localhost:3001/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data));
  };

  
  useEffect(() => {
    fetchTasks();
  }, []);

// Crear tarea
const handleSubmit = (e) => {
e.preventDefault();

if (!title.trim()) return; //  evita tareas vacías y no permite agregar tareas que solo contengan espacios en blanco

  fetch("http://localhost:3001/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title })
  })
    .then(() => {
      setTitle("");
      fetchTasks();
    });
};

  const handleDelete = (id) => { // Elimina tareas y recarga la lista de tareas después de eliminar
  fetch(`http://localhost:3001/api/tasks/${id}`, {
    method: "DELETE"
  })
    .then(() => fetchTasks());
};

const toggleComplete = (task) => { // Marcar tarea como completada o incompleta
  fetch(`http://localhost:3001/api/tasks/${task.id}`, { // Reemplaza con la URL correcta de la API
    method: "PUT",
    headers: {
      "Content-Type": "application/json" // Asegurar el tipo de contenido para enviar JSON
    },
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      completed: !task.completed
    })
    
  })
    .then(() => fetchTasks()); // Recargar la lista de tareas después de actualizar el estado de completado
};


// Editar tarea, agregue un boton para eliminar cada tarea agregada y
  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });
 
  return ( // Agregue botones para filtrar las tareas por estado (todas, completadas, pendientes) y un botón para eliminar cada tarea agregada
    <div> 
      <h1>Lista de tareas</h1>
 
      <form onSubmit={handleSubmit}>  
        <input
          type="text"
          placeholder="Nueva tarea" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>
      
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        
  <button onClick={() => setFilter("all")} style={{ marginRight: "5px" }}>
    Todas
  </button>

  <button onClick={() => setFilter("completed")} style={{ marginRight: "5px" }}>
    Completadas
  </button>

  <button onClick={() => setFilter("pending")}>
    Pendientes
  </button>
</div>

      <ul>
        {filteredTasks.map(task => (
          <li key={task.id}>
  <span // Agregue un span para manejar el clic y marcar la tarea como completada o incompleta, queda centrada finalmente la tarea y el botón de eliminar
    onClick={() => toggleComplete(task)}
    style={{
      cursor: "pointer",
      textDecoration: task.completed ? "line-through" : "none"
    }}
  >
    {task.completed ? "✅" : "❌"} {task.title} 
  </span>

  <button onClick={() => handleDelete(task.id)}>
    ❌ 
  </button>
</li>
// Cierre del codigo, funciona a la perfecciòn y se pueden agregar tareas, eliminarlas, marcarlas como completadas o pendientes, y filtrar por estado.

        ))}
      </ul> 

      
    </div>
    
  );
}

export default App;
