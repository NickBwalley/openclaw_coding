"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

const STORAGE_KEY = "daily-todos-v1";

export default function Home() {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved) as Todo[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.done).length;
    const pending = tasks.length - completed;
    const successRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

    return { completed, pending, successRate };
  }, [tasks]);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = taskText.trim();

    if (!text) return;

    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        text,
        done: false,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    setTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((current) => current.filter((task) => !task.done));
  };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>openclaw coding</p>
            <h1>Daily Todos</h1>
            <p className={styles.lead}>
              Add tasks, tick them off, and keep an eye on your daily win rate.
            </p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={clearCompleted}
            disabled={!stats.completed}
          >
            Clear completed
          </button>
        </header>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Success rate</span>
            <strong>{stats.successRate}%</strong>
          </article>
        </section>

        <section className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span>Day success rate</span>
            <strong>{stats.successRate}%</strong>
          </div>
          <div className={styles.progressBar} aria-hidden="true">
            <div
              className={styles.progressFill}
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </section>

        <form className={styles.form} onSubmit={addTask}>
          <input
            type="text"
            value={taskText}
            onChange={(event) => setTaskText(event.target.value)}
            placeholder="Enter a task for today"
            aria-label="Enter a task for today"
          />
          <button type="submit">Add task</button>
        </form>

        <section className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2>Your tasks</h2>
            <p>{tasks.length} total</p>
          </div>

          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tasks yet. Add one above to get started.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {tasks.map((task) => (
                <li key={task.id} className={task.done ? styles.done : ""}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>{task.text}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.text}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
