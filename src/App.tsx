import { useEffect, useState } from 'react'
import './App.css'
import { 
  useAuth, 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton 
} from '@clerk/clerk-react';
import { useApi } from './hooks/useApi';

interface ToDo {
  id: number;
  title: string;
  completed: boolean;
};

function App() {
  const api = useApi();
  const { getToken } = useAuth();
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  // データの取得（GET）
  const fetchTodos = async () => {
    try {
      const data = await api.get("/todos");
      setTodos(data.todos);
    } catch(err) {
      setError('サーバーに接続できません');
    }
  }

  useEffect(() => {
     // useEffectでデータを取得するのはアンチパターンだが、簡略化のため
    fetchTodos();
  }, []);

  // データの追加（POST)
  const handleAddTodo = async () => {
    if(!title.trim()) return;

    try {
      await api.post("/todos", {title});
      await fetchTodos();
      setError("");
      setTitle("");
    } catch(err) {
      setError("送信エラー: サーバーが起動しているか確認してください");
    }
    
  }

  // データの更新（PUT）
  const handleToggleTodo = async (id: number) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;

    try {
      await api.put(`/todos/${id}`, { 
        ...todoToUpdate,
        completed: !todoToUpdate.completed
       });
      setTodos(todos.map(todo => todo.id === id ? {...todo, completed : !todo.completed} : todo));

    } catch(err) {
      setError('更新エラー：サーバーとの通信に失敗しました');
    }
  }

  // データの削除（DELETE）
  const handleDeleteTodo = async (id: number) => {

    if (!window.confirm("このタスクを削除しますか？")) return;

    const todoToDelete = todos.find(todo => todo.id === id);
    if (!todoToDelete) return;

    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch(err) {
        setError('削除エラー：サーバーとの通信に失敗しました');
      }
  }

  // 全件削除（DELETE）
  const handleAllDeleteTodo = async () => {

    if (!window.confirm("すべてのタスクを削除してもよろしいですか？")) return;

    try {
      await api.delete("/todos");
      setTodos([]);
      setError("");
    } catch (err) {
      setError("通信エラー：サーバーを確認してください");
    }
  }

  return (
    <>
    <nav className="flex justify-end p-2">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-outline btn-primary">Sign in</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
    </nav>
    <SignedIn>
      <div className='h-screen max-h-screen flex items-center justify-center bg-base-200'>
        <div className='card bg-white w-full max-w-md shrink-0 shadow-2xl'>
          <div className="card-body">
            <h1 className="card-title">Todo アプリ</h1>
            {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
            )}
            <div className='flex justify-between w-full'>
              <input
                className="input bg-white"
                type="text"
                name="title"
                placeholder='新しいタスクを入力...'
                aria-label='新しいタスクを入力'
                value={title}
                onChange={ e => setTitle(e.target.value)}
              />
              <button
                className="btn btn-neutral"
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
                  <ul className='flex flex-col gap-y-2.5'>
                    {todos.map(todo => (
                      <li key={todo.id} className='flex items-center justify-between'>
                        <label className="label">
                          <input type="checkbox" className="checkbox" checked={todo.completed} onChange={() => handleToggleTodo(todo.id) } />
                          <span className={`flex-1 ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}>{todo.title}</span>
                        </label>
                        <button className='btn btn-sm btn-outline' onClick={() => handleDeleteTodo(todo.id)}>削除</button>
                      </li>
                    ))}
                  </ul>
                )
              }
            </div>
            {todos.length > 0 && (
              <div className="flex justify-between items-center mt-2.5 pt-4 border-t border-gray-200">
                <p className="text-sm ">
                  完了済み: {todos.filter((todo) => todo.completed).length} /{" "}
                  {todos.length}
                </p>
                <button className="btn btn-sm btn-soft" onClick={handleAllDeleteTodo}>全件削除</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SignedIn>
    <SignedOut>
      <div className="text-center py-20">
        <p className="text-gray-600">Todo を管理するにはサインインしてください。</p>
      </div>
    </SignedOut>
    </>
  )
}

export default App
