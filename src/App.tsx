import { useState } from 'react'
import './App.css'

function App() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState([
    {
      id :1,
      title: "Todo 1",
      completed: false
    },
    {
      id: 2,
      title: "Todo 2",
      completed: false,
    },
    {
      id: 3,
      title: "Todo 3",
      completed: false
    }
  ]

  );

  const handleAddTodo = () => {
    if(title !== "") {
      setTodos([
        ...todos,
        {
          id: todos.length + 1,
          title: title,
          completed: false,
        }
      ]);
    }
    setTitle("");
  }

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map(todo => todo.id === id ? {...todo, completed : !todo.completed} : todo)
    );
  }

  return (
    <>
    <div className='h-screen max-h-screen flex items-center justify-center'>
      <div className='card bg-base-100 w-full max-w-md shrink-0 shadow-2xl'>
        <div className="card-body">
          <h1 className="card-title">Todo アプリ</h1>
          <div className='flex gap-2'>
            <input
              className="input"
              type="text"
              name="title"
              placeholder='新しいタスクを入力...'
              aria-label='新しいタスクを入力'
              value={title}
              onChange={ e => setTitle(e.target.value)}
            />
            <button
              className="btn"
              onClick={handleAddTodo}
            >
            追加
            </button>
          </div>
          <div className='mt-4'>
            {
              todos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg">タスクがありません</p>
                  <p className="text-sm">新しいタスクを追加してください</p>
                </div>
              ) : (
                <ul className='flex flex-col gap-y-1'>
                  {todos.map(todo => (
                    <li key={todo.id}>
                      <label className="label">
                        <input type="checkbox" className="checkbox" checked={todo.completed} onChange={() => handleToggleTodo(todo.id) } />
                        <span className={`flex-1 ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}>{todo.title}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )
            }
          </div>
          {todos.length > 0 && (
            <div className="mt-2.5 pt-4 border-t border-gray-200">
              <p className="text-sm text-center">
                完了済み: {todos.filter((todo) => todo.completed).length} /{" "}
                {todos.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default App
