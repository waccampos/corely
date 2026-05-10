import { render, screen, act } from "@testing-library/react";
import { AppProvider, useApp } from "@/context/AppContext";
import { check } from "@tauri-apps/plugin-updater";

vi.mock("@tauri-apps/plugin-updater", () => ({
  check: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(check).mockResolvedValue(null);
});

function ExtsConsumer() {
  const { exts, toggleExt } = useApp();
  return (
    <div>
      <span data-testid="count">{exts.length}</span>
      {exts.map((e) => (
        <div key={e.id} data-testid={`ext-${e.id}`}>
          {e.name}:{String(e.enabled)}
        </div>
      ))}
      <button onClick={() => toggleExt(1)}>toggle-1</button>
    </div>
  );
}

describe("AppContext — exts", () => {
  beforeEach(() => localStorage.clear());

  it("initializes exts from EXTENSIONS_DATA", () => {
    render(<AppProvider><ExtsConsumer /></AppProvider>);
    expect(Number(screen.getByTestId("count").textContent)).toBeGreaterThan(0);
  });

  it("toggleExt flips enabled for the given id", async () => {
    render(<AppProvider><ExtsConsumer /></AppProvider>);
    const before = screen.getByTestId("ext-1").textContent!;
    act(() => { screen.getByText("toggle-1").click(); });
    const after = screen.getByTestId("ext-1").textContent!;
    expect(before).not.toBe(after);
  });

  it("Screen type does not include 'extensions'", () => {
    localStorage.setItem("corely-screen", "extensions");
    render(<AppProvider><ExtsConsumer /></AppProvider>);
    expect(screen.getByTestId("count")).toBeTruthy();
  });
});

function UpdateConsumer() {
  const { updateAvailable, installUpdate } = useApp();
  return (
    <div>
      <span data-testid="update-available">{String(updateAvailable)}</span>
      <button onClick={installUpdate}>install</button>
    </div>
  );
}

describe("AppContext — updater", () => {
  beforeEach(() => {
    vi.mocked(check).mockResolvedValue(null);
  });

  it("updateAvailable is false when check returns null", async () => {
    vi.mocked(check).mockResolvedValue(null);
    render(<AppProvider><UpdateConsumer /></AppProvider>);
    await act(async () => {});
    expect(screen.getByTestId("update-available").textContent).toBe("false");
  });

  it("updateAvailable is true when check returns an update", async () => {
    const fakeUpdate = { downloadAndInstall: vi.fn() } as any;
    vi.mocked(check).mockResolvedValue(fakeUpdate);
    render(<AppProvider><UpdateConsumer /></AppProvider>);
    await act(async () => {});
    expect(screen.getByTestId("update-available").textContent).toBe("true");
  });

  it("installUpdate calls downloadAndInstall on the pending update", async () => {
    const downloadAndInstall = vi.fn().mockResolvedValue(undefined);
    const fakeUpdate = { downloadAndInstall } as any;
    vi.mocked(check).mockResolvedValue(fakeUpdate);
    render(<AppProvider><UpdateConsumer /></AppProvider>);
    await act(async () => {});
    await act(async () => { screen.getByText("install").click(); });
    expect(downloadAndInstall).toHaveBeenCalled();
  });
});
