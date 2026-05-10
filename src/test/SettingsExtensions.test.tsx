import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "@/context/AppContext";
import { SettingsScreen } from "@/screens/settings";
import { invoke } from "@tauri-apps/api/core";

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  mockInvoke.mockImplementation((cmd: string) => {
    if (cmd === "get_shortcuts") return Promise.resolve([
      { action: "Open Launcher", keys: ["⌃", "⌘", "K"] },
    ]);
    return Promise.resolve(null);
  });
});

describe("SettingsScreen — seção Extensões", () => {
  it("exibe o item 'Extensões' no sub-nav", () => {
    render(<AppProvider><SettingsScreen /></AppProvider>);
    expect(screen.getByText("Extensões")).toBeTruthy();
  });

  it("exibe todas as extensões com toggles ao navegar para a seção", async () => {
    render(<AppProvider><SettingsScreen /></AppProvider>);
    await userEvent.click(screen.getByText("Extensões"));
    expect(screen.getByText("Clipboard History")).toBeTruthy();
    expect(screen.getByText("Docker Manager")).toBeTruthy();
  });
});
