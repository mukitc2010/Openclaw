"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Action = {
  id: string;
  label: string;
  run: () => void;
};

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

export function QuickActions() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const projectPage = pathname.startsWith("/projects/") && pathname !== "/projects/new";

  const actions = useMemo<Action[]>(() => {
    const items: Action[] = [
      { id: "go_home", label: "Go to Dashboard", run: () => router.push("/") },
      { id: "new_project", label: "Create New Project", run: () => router.push("/projects/new") },
    ];

    if (pathname === "/") {
      items.push({
        id: "jump_projects",
        label: "Jump to Projects Section",
        run: () => {
          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      });
    }

    if (projectPage) {
      items.push(
        {
          id: "generate_all",
          label: "Run Full Generation",
          run: () => {
            window.dispatchEvent(new CustomEvent("openclaw:quick-action", { detail: { action: "generate_all" } }));
          },
        },
        {
          id: "run_outline",
          label: "Run PM Outline",
          run: () => {
            window.dispatchEvent(new CustomEvent("openclaw:quick-action", { detail: { action: "run_outline" } }));
          },
        },
        {
          id: "run_agile",
          label: "Run Agile Planner",
          run: () => {
            window.dispatchEvent(new CustomEvent("openclaw:quick-action", { detail: { action: "run_agile" } }));
          },
        },
        {
          id: "run_arch",
          label: "Run Architecture Module",
          run: () => {
            window.dispatchEvent(new CustomEvent("openclaw:quick-action", { detail: { action: "run_architecture" } }));
          },
        },
        {
          id: "run_testing",
          label: "Run QA Testing Module",
          run: () => {
            window.dispatchEvent(new CustomEvent("openclaw:quick-action", { detail: { action: "run_testing" } }));
          },
        },
        {
          id: "jump_outline",
          label: "Jump to Project Outline",
          run: () => {
            document.getElementById("outline")?.scrollIntoView({ behavior: "smooth", block: "start" });
          },
        },
        {
          id: "jump_sprint",
          label: "Jump to Sprint Board",
          run: () => {
            document.getElementById("sprint")?.scrollIntoView({ behavior: "smooth", block: "start" });
          },
        },
        {
          id: "jump_timeline",
          label: "Jump to Status Timeline",
          run: () => {
            document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
          },
        },
      );
    }

    return items;
  }, [pathname, projectPage, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((item) => item.label.toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const hotkey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!hotkey) return;
      event.preventDefault();
      setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const [shortcutHint, setShortcutHint] = useState("Ctrl+K");
  useEffect(() => {
    setShortcutHint(isMac() ? "Cmd+K" : "Ctrl+K");
  }, []);

  function execute(action: Action) {
    action.run();
    setOpen(false);
  }

  return (
    <>
      <button className="quick-actions-trigger" onClick={() => setOpen(true)}>
        Quick Actions
        <span>{shortcutHint}</span>
      </button>

      {open && (
        <div className="quick-overlay" onClick={() => setOpen(false)}>
          <div className="quick-modal" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actions..."
              aria-label="Search quick actions"
            />

            <div className="quick-list" role="listbox" aria-label="Quick actions">
              {!filtered.length && <p className="state-text">No matching actions.</p>}
              {filtered.map((action) => (
                <button key={action.id} className="quick-item" onClick={() => execute(action)}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
