import { render } from "@testing-library/react";
import { Titlebar } from "@/components/Titlebar";

vi.mock("@/context/AppContext", () => ({
  useApp: vi.fn(),
}));

import { useApp } from "@/context/AppContext";

describe("Titlebar — update badge", () => {
  it("does not render badge when updateAvailable is false", () => {
    vi.mocked(useApp).mockReturnValue({
      theme: "dark", accent: "#00e676", screen: "launcher",
      setScreen: vi.fn(), updateAvailable: false,
    } as any);
    const { container } = render(<Titlebar />);
    expect(container.querySelector(".bg-red-500")).toBeNull();
  });

  it("renders red dot badge when updateAvailable is true", () => {
    vi.mocked(useApp).mockReturnValue({
      theme: "dark", accent: "#00e676", screen: "launcher",
      setScreen: vi.fn(), updateAvailable: true,
    } as any);
    const { container } = render(<Titlebar />);
    expect(container.querySelector(".bg-red-500")).toBeTruthy();
  });
});
