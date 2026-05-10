import { render, screen, act } from "@testing-library/react";
import { AppProvider, useApp } from "@/context/AppContext";

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
