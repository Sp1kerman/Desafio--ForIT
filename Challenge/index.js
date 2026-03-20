const express = require("express"); // Se importa el módulo Express, que es un framework de Node.js para construir aplicaciones web y APIs. Express proporciona una forma sencilla de manejar rutas, solicitudes y respuestas HTTP, así como middleware para agregar funcionalidades adicionales a la aplicación.
const cors = require("cors"); // Se importa el módulo CORS (Cross-Origin Resource Sharing), que es un middleware de Express que permite controlar el acceso a recursos desde diferentes orígenes. CORS es importante para las aplicaciones web que consumen APIs desde dominios diferentes, ya que los navegadores bloquean las solicitudes entre dominios por razones de seguridad. Al usar cors(), se habilita el acceso a la API desde cualquier origen, lo que facilita el desarrollo y la integración con aplicaciones frontend.

const app = express(); // Se crea una instancia de la aplicación Express, que se utilizará para definir rutas, middleware y configurar el servidor.
const PORT = process.env.PORT || 3001; // Se define el puerto en el que el servidor escuchará las solicitudes. Se utiliza process.env.PORT para permitir que el puerto sea configurado a través de una variable de entorno, lo cual es útil en entornos de producción. Si no se proporciona un valor para process.env.PORT, se utilizará el puerto 3001 por defecto.

app.use(cors()); // la mejor opcion es colocar el middleware de CORS antes de definir las rutas, para asegurarse de que todas las solicitudes a la API tengan habilitado CORS. Esto permite que las aplicaciones frontend puedan consumir la API sin problemas de bloqueo entre dominios.
app.use(express.json()); // Se configuran los middleware para la aplicación Express. app.use(cors()) habilita CORS para permitir solicitudes desde cualquier origen, lo que es útil para el desarrollo y la integración con aplicaciones frontend. app.use(express.json()) es un middleware incorporado en Express que analiza las solicitudes entrantes con cargas útiles JSON y las convierte en objetos JavaScript accesibles a través de req.body. Esto facilita el manejo de datos enviados en formato JSON desde el cliente.

let tasks = [];

// Middleware - Input validation esto sirve para validar que el título de la tarea sea una cadena no vacía y que la descripción, si se proporciona, también sea una cadena. Si alguna de estas validaciones falla, se devuelve un error 400 con un mensaje descriptivo. Si todo es correcto, se llama a next() para continuar con el siguiente middleware o ruta.
const validateTask = (req, res, next) => {
  if (!req.body.title || typeof req.body.title !== "string" || req.body.title.trim() === "") {
    return res.status(400).json({ error: "Title is required and must be a non-empty string" });
  }
  if (req.body.description && typeof req.body.description !== "string") {
    return res.status(400).json({ error: "Description must be a string" });
  }
  next();
};

// Middleware - Error handling -- sirve para capturar cualquier error que ocurra en las rutas anteriores y enviar una respuesta de error genérica al cliente, además de registrar el error en la consola para su posterior análisis.
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
};

// GET - obtener tareas -- se obtienen tareas mediante una solicitud GET a la ruta "/api/tasks". Si la operación es exitosa, se devuelve un JSON con la lista de tareas. Si ocurre un error, se devuelve un error 500 con un mensaje descriptivo.
app.get("/api/tasks", (req, res) => {
  try {
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST - crear tarea -- se crea una nueva tarea mediante una solicitud POST a la ruta "/api/tasks". Si la operación es exitosa, se devuelve un JSON con la tarea creada y un código de estado 201. Si ocurre un error, se devuelve un error 500 con un mensaje descriptivo.
app.post("/api/tasks", validateTask, (req, res) => {
  try {
    const newTask = {
      id: Date.now().toString(),
      title: req.body.title.trim(),
      description: req.body.description?.trim() || "",
      completed: false,
      createdAt: new Date()
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT - actualizar tarea -- se actualiza una tarea existente mediante una solicitud PUT a la ruta "/api/tasks/:id". Si la tarea con el ID especificado no se encuentra, se devuelve un error 404. Si la operación es exitosa, se devuelve un JSON con la tarea actualizada. Si ocurre un error, se devuelve un error 500 con un mensaje descriptivo.
app.put("/api/tasks/:id", validateTask, (req, res) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = {  // En esta sección se crea un nuevo objeto updatedTask que contiene las propiedades de la tarea original (tasks[taskIndex]) utilizando el operador de propagación (...), y luego se actualizan las propiedades title, description, completed y updatedAt con los valores proporcionados en la solicitud. El título se recorta para eliminar espacios en blanco, la descripción se recorta o se establece como una cadena vacía si no se proporciona, y el estado de completado se actualiza solo si se proporciona en la solicitud. Finalmente, se actualiza la tarea en el array tasks con el nuevo objeto updatedTask y se devuelve como respuesta.
      ...tasks[taskIndex],
      title: req.body.title.trim(),
      description: req.body.description?.trim() || "",
      completed: req.body.completed !== undefined ? req.body.completed : tasks[taskIndex].completed,
      updatedAt: new Date()
    };

    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE - eliminar tarea -- se elimina una tarea existente mediante una solicitud DELETE a la ruta "/api/tasks/:id". Si la tarea con el ID especificado no se encuentra, se devuelve un error 404. Si la operación es exitosa, se devuelve un mensaje de éxito. Si ocurre un error, se devuelve un error 500 con un mensaje descriptivo.
app.delete("/api/tasks/:id", (req, res) => {
  try {
    const { id } = req.params; // En esta secciòn se extrae el ID de la tarea a eliminar de los parámetros de la solicitud utilizando req.params.id. Luego, se busca el índice de la tarea en el array tasks utilizando el método findIndex, que devuelve el índice del primer elemento que cumple con la condición especificada (en este caso, que el ID de la tarea coincida con el ID proporcionado). Si no se encuentra la tarea, se devuelve un error 404. Si se encuentra, se elimina la tarea del array utilizando el método splice y se devuelve un mensaje de éxito.
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks.splice(taskIndex, 1); // Aca se elimina la tarea del array utilizando el método splice, que modifica el array original eliminando el elemento en el índice especificado.
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Error handling middleware -- La solucion fue agregar el middleware de manejo de errores al final de la cadena de middlewares y rutas, asegurando que cualquier error que ocurra en las rutas anteriores sea capturado y manejado adecuadamente.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:3001/api/tasks`); // Cambié la URL para reflejar la ruta base de la API, aunque en realidad el servidor está escuchando en http://localhost:3001. La ruta completa para acceder a las tareas sería http://localhost:3001/api/tasks.
});
