import { render, screen, act } from "@testing-library/react";
import { SettingsScreen } from "@/screens/settings";

vi.mock("@tauri-apps/api/app", () => ({
  getVersion: vi.fn().mockResolvedValue("0.2.0"),
}));

vi.mock("@/context/AppContext", () => ({
  useApp: vi.fn().mockReturnValue({
    theme: "dark",
    accent: "#00e676",
    compact: false,
    showIcons: true,
    transparency: true,
    exts: [],
    toggleExt: vi.fn(),
    updateAvailable: false,
    installUpdate: vi.fn(),
    setTheme: vi.fn(),
    setAccent: vi.fn(),
    setCompact: vi.fn(),
    setShowIcons: vi.fn(),
    setTransparency: vi.fn(),
  }),
}));

vi.mock("@/hooks/useShortcuts", () => ({
  useShortcuts: vi.fn().mockReturnValue({ shortcuts: [], updateShortcut: vi.fn(), resetShortcuts: vi.fn() }),
}));

import { useApp } from "@/context/AppContext";

async function renderAbout(updateAvailable = false) {
  vi.mocked(useApp).mockReturnValue({
    theme: "dark",
    accent: "#00e676",
    compact: false,
    showIcons: true,
    transparency: true,
    exts: [],
    toggleExt: vi.fn(),
    updateAvailable,
    installUpdate: vi.fn(),
    setTheme: vi.fn(),
    setAccent: vi.fn(),
    setCompact: vi.fn(),
    setShowIcons: vi.fn(),
    setTransparency: vi.fn(),
  } as any);
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<SettingsScreen />);
  });
  // Navigate to Sobre
  act(() => { screen.getByText("Sobre").click(); });
  await act(async () => {});
  return result!;
}

describe("SettingsScreen — Sobre", () => {
  it("shows the app version from getVersion()", async () => {
    await renderAbout();
    expect(screen.getByText(/0\.2\.0/)).toBeTruthy();
  });

  it("does not show update button when updateAvailable is false", async () => {
    await renderAbout(false);
    expect(screen.queryByText(/Atualizar agora/)).toBeNull();
  });

  it("shows update button when updateAvailable is true", async () => {
    await renderAbout(true);
    expect(screen.getByText(/Atualizar agora/)).toBeTruthy();
  });
});
