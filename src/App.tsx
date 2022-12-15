import React, { useEffect } from "react";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

import "./App.scss";

interface tasksProps {
  [key: string]: TodoProps;
}

interface todoList {
  tasks: tasksProps;
  tasksOrder: string[];
}

interface TodoProps {
  id: string;
  completed: boolean;
  text: string;
}

enum scopeType {
  All = 1,
  Active,
  Completed,
}

const defaultTasks: TodoProps[] = [
  { id: "1", completed: true, text: "Complete online JavaScript course" },
  { id: "2", completed: false, text: "Jog around the park 3x" },
  { id: "3", completed: false, text: "10 minutes meditation" },
  { id: "4", completed: false, text: "Read for 1 hour" },
  { id: "5", completed: false, text: "Pick up groceries" },
  { id: "6", completed: false, text: "Complete Todo App on Frontend Mentor" },
];

function App() {
  const [darkMode, setDarkMode] = React.useState(true);

  const addDarkMode = () => {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    setDarkMode(true);
  };

  const addLightMode = () => {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    setDarkMode(false);
  };

  React.useEffect(() => {
    defaultTasks.forEach((task) => addTodoItem(task));
  }, []);

  function onClickThemeButton() {
    if (darkMode) {
      addLightMode();
    } else addDarkMode();
  }

  const [todoList, setTodoList] = React.useState<todoList>({
    tasks: {},
    tasksOrder: [],
  });
  const [todoScope, setTodoScope] = React.useState(scopeType.All);

  let itemsLeft = todoList.tasksOrder.filter(
    (taskID) => todoList.tasks[taskID].completed === false
  ).length;

  let todoDisplay: TodoProps[] = [];
  todoList.tasksOrder.forEach(
    (taskID, index) => (todoDisplay[index] = todoList.tasks[taskID])
  );

  function addTodoItem(item: TodoProps) {
    setTodoList((state) => {
      return {
        tasks: { ...state.tasks, [item.id]: item },
        tasksOrder: [...state.tasksOrder, item.id],
      };
    });
  }

  function onChangeStatus(status: boolean, todoID: string) {
    setTodoList((state) => {
      let newTasks = state.tasks;
      newTasks[todoID].completed = status;
      return { tasks: newTasks, tasksOrder: state.tasksOrder };
    });
  }

  function onClickScope(event: React.MouseEvent<HTMLButtonElement>) {
    setTodoScope(Number(event.currentTarget.value));
  }

  function onClickClear(event: React.MouseEvent<HTMLButtonElement>) {
    setTodoList((state) => {
      let newOrder;

      newOrder = state.tasksOrder.filter(
        (taskID) => todoList.tasks[taskID].completed !== true
      );

      let newTasks: tasksProps = {};
      newOrder.forEach((taskID) => (newTasks[taskID] = state.tasks[taskID]));

      return { tasks: newTasks, tasksOrder: newOrder };
    });
  }

  function onClickDelete(todoID: string) {
    setTodoList((state) => {
      let newOrder;
      newOrder = state.tasksOrder.filter((taskID) => taskID !== todoID);
      let newTasks: tasksProps = {};
      newOrder.forEach((taskID) => (newTasks[taskID] = state.tasks[taskID]));

      return { tasks: newTasks, tasksOrder: newOrder };
    });
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    let newOrder = todoList.tasksOrder;

    newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, draggableId);

    setTodoList((state) => {
      return { ...state, tasksOrder: newOrder };
    });
  };

  return (
    <main>
      <div className="app">
        <div className="header">
          <h1>T O D O</h1>
          <button onClick={onClickThemeButton}>
            <img
              src={
                darkMode ? "./images/icon-sun.svg" : "./images/icon-moon.svg"
              }
              alt="theme switch"
            />
          </button>
        </div>
        <div>
          <TodoForm addTodoItem={addTodoItem} />
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <TodoList
            todoOrder={todoList.tasksOrder}
            todoList={todoDisplay}
            todoScope={todoScope}
            onChangeStatus={onChangeStatus}
            onClickDelete={onClickDelete}
          />
        </DragDropContext>

        <div className="footer">
          <span className="items-count">{itemsLeft} items left</span>
          <div className="desk-scopes">
            <ScopeButtons todoScope={todoScope} onClickScope={onClickScope} />
          </div>
          <button onClick={onClickClear}>Clear Completed</button>
        </div>
        <div className="mobile-scopes">
          <ScopeButtons todoScope={todoScope} onClickScope={onClickScope} />
        </div>
        <div className="drag-text">Drag and drop to reorder list</div>
      </div>
    </main>
  );
}

interface todoListProps {
  todoOrder: string[];
  todoList: TodoProps[];
  todoScope: scopeType;
  onChangeStatus: (status: boolean, todoID: string) => void;
  onClickDelete: (todoID: string) => void;
}

function TodoList({
  todoOrder,
  todoList,
  todoScope,
  onChangeStatus,
  onClickDelete,
}: todoListProps) {
  // space
  const [todoDisplay, setTodoDisplay] = React.useState<TodoProps[]>([]);

  useEffect(() => {
    setTodoDisplay((state) =>
      todoList.filter((item: TodoProps) => {
        if (todoScope === scopeType.Active) {
          if (item.completed === true) {
            return false;
          }
        } else if (todoScope === scopeType.Completed) {
          if (item.completed === false) {
            return false;
          }
        }
        return true;
      })
    );
  }, [todoList, todoScope]);

  return (
    <div>
      <Droppable droppableId={"tasksList"}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {todoDisplay.map((item) => {
              return (
                <TodoBasic
                  key={item.id}
                  id={item.id}
                  index={todoOrder.findIndex((taskID) => taskID === item.id)}
                  todoID={item.id}
                  todoStatus={item.completed}
                  todoText={item.text}
                  onChangeStatus={onChangeStatus}
                  onClickDelete={onClickDelete}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function TodoForm({ addTodoItem }: any) {
  const [todoText, setTodoText] = React.useState("");
  const [todoStatus, setTodoStatus] = React.useState(false);

  function onChangeStatus(event: React.ChangeEvent<HTMLInputElement>) {
    setTodoStatus(event.target.checked);
  }

  function onChangeText(event: React.ChangeEvent<HTMLInputElement>) {
    setTodoText(event.target.value);
  }

  function onSubmitItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let todoData: TodoProps = {
      id: Date.now().toString(),
      text: todoText,
      completed: todoStatus,
    };
    setTodoText("");
    addTodoItem(todoData);
  }

  return (
    <form className="" onSubmit={onSubmitItem}>
      <input
        className="checkbox"
        type="checkbox"
        checked={todoStatus}
        onChange={onChangeStatus}
        aria-label="Task status"
      />
      <input
        onChange={onChangeText}
        value={todoText}
        className="text-input"
        type="text"
        placeholder="Create a new todo..."
      />
    </form>
  );
}

function TodoBasic({
  id,
  index,
  todoID,
  todoStatus,
  onChangeStatus,
  todoText,
  onClickDelete,
}: any) {
  function onChangeInput(
    event: React.ChangeEvent<HTMLInputElement>,
    todoID: string
  ) {
    onChangeStatus(event.target.checked, todoID);
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          className="app-item"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div className="app-item-main">
            <input
              className="checkbox"
              type="checkbox"
              checked={todoStatus}
              onChange={(event) => onChangeInput(event, todoID)}
            />
            <span
              className={`task-text ${
                todoStatus === true ? "task-complete" : ""
              }`}
            >
              {todoText}
            </span>
          </div>
          <button
            onClick={(event) => onClickDelete(todoID)}
            className="btn-close"
          >
            <img src="./images/icon-cross.svg" alt="" />
          </button>
        </div>
      )}
    </Draggable>
  );
}

function ScopeButtons({ todoScope, onClickScope }: any) {
  return (
    <>
      <button
        className={`${todoScope === scopeType.All ? "current-scope" : ""}`}
        value={scopeType.All}
        onClick={onClickScope}
      >
        All
      </button>
      <button
        className={`${todoScope === scopeType.Active ? "current-scope" : ""}`}
        value={scopeType.Active}
        onClick={onClickScope}
      >
        Active
      </button>
      <button
        className={`${
          todoScope === scopeType.Completed ? "current-scope" : ""
        }`}
        value={scopeType.Completed}
        onClick={onClickScope}
      >
        Completed
      </button>
    </>
  );
}

export default App;
