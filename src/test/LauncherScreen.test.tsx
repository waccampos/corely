import { render, screen } from "@testing-library/react";
import { AppProvider } from "@/context/AppContext";
import { LauncherScreen } from "@/screens/launcher";
import { invoke } from "@tauri-apps/api/core";

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  mockInvoke.mockImplementation((cmd: string) => {
    if (cmd === "get_items") return Promise.resolve([]);
    if (cmd === "get_clipboard_history") return Promise.resolve([
      { id: 1, type: "text", content: "npm install tailwindcss", timestamp: 1700000000 },
    ]);
    return Promise.resolve(null);
  });
});

describe("LauncherScreen — grupos", () => {
  it("exibe o grupo 'Extensões' com extensões ativas", async () => {
    render(<AppProvider><LauncherScreen /></AppProvider>);
    expect(await screen.findByText("Extensões")).toBeTruthy();
    expect(await screen.findByText("Clipboard History")).toBeTruthy();
  });

  it("não exibe extensões inativas (Docker Manager está disabled por padrão)", async () => {
    render(<AppProvider><LauncherScreen /></AppProvider>);
    await screen.findByText("Clipboard History");
    expect(screen.queryByText("Docker Manager")).toBeNull();
  });

  it("exibe o grupo 'Clipboard' com itens do histórico", async () => {
    render(<AppProvider><LauncherScreen /></AppProvider>);
    expect(await screen.findByText("Clipboard")).toBeTruthy();
    expect(await screen.findByText("npm install tailwindcss")).toBeTruthy();
  });
});
