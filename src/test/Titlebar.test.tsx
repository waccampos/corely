import { render, screen } from "@testing-library/react";
import { AppProvider } from "@/context/AppContext";
import { Titlebar } from "@/components/Titlebar";

describe("Titlebar", () => {
  it("renders exactly one button (settings gear)", () => {
    render(<AppProvider><Titlebar /></AppProvider>);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("settings button has aria-label 'Configurações'", () => {
    render(<AppProvider><Titlebar /></AppProvider>);
    expect(screen.getByRole("button", { name: "Configurações" })).toBeTruthy();
  });
});
