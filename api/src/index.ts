import { serve } from '@hono/node-server'
import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

const prisma = new PrismaClient()
const app = new Hono()

app.use(
  '/*',
  cors({
    origin: 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.use('*', clerkMiddleware())

// 1. 全件取得 (GET)
app.get('/todos', async (c) => {
  const auth = getAuth(c);
  if(!auth?.userId) {
    return c.json({ todos: []});
  }
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' }
    });
    return c.json({ todos });
  } catch (error) {
    return c.json({ error: "取得に失敗しました" }, 500);
  }
})

// 2. 新規作成 (POST)
app.post('/todos', async (c) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401)
  
  try {
    const { title } = await c.req.json();
    const newTodo = await prisma.todo.create({
      data: {
        title,
        userId: auth.userId,
        completed: false,
      },
    });
    return c.json(newTodo, 201);
  } catch (error) {
    return c.json({ error: "保存に失敗しました" }, 500);
  }
})

// 3. 更新 (PUT) - 完了状態の切り替え
app.put("/todos/:id", async (c) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401)
  
  try {
    const id = Number(c.req.param('id'));
    const { completed } = await c.req.json();
    
    const updatedTodo = await prisma.todo.update({
      where: { 
        id: id,
        userId: auth.userId,
      },
      data: { completed },
    });
    return c.json(updatedTodo);
  } catch (error) {
    return c.json({ error: "更新に失敗しました" }, 404);
  }
});

// 4. 個別削除 (DELETE)
app.delete("/todos/:id", async (c) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401)

  try {
    const id = Number(c.req.param('id'));
    await prisma.todo.delete({
      where: {
        id: id,
        userId: auth.userId,
      },
    });
    return c.json({ message: "Deleted", id });
  } catch (error) {
    return c.json({ error: "削除に失敗しました" }, 404);
  }
});

// 5. 全削除 (DELETE)
app.delete("/todos", async (c) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401)

  try {
    await prisma.todo.deleteMany({
      where: { userId: auth.userId }
    }); // SQL の TRUNCATE または DELETE FROM に相当
    return c.json({ message: "All todos deleted" });
  } catch (error) {
    return c.json({ error: "全削除に失敗しました" }, 500);
  }
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})