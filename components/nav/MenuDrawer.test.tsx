import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import MenuDrawer from "./MenuDrawer";

vi.mock("@/i18n/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("@/i18n/navigation")>(
      "@/i18n/navigation",
    );
  return {
    ...actual,
    usePathname: () => "/wordle",
    useRouter: () => ({ replace: () => {}, push: () => {} }),
  };
});

function renderDrawer() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <MenuDrawer />
    </NextIntlClientProvider>,
  );
}

async function click(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el);
  });
}

async function press(key: string) {
  await act(async () => {
    fireEvent.keyDown(document, { key });
  });
}

describe("MenuDrawer", () => {
  it("starts closed", () => {
    renderDrawer();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens on the burger and shows the panel", async () => {
    renderDrawer();
    await click(screen.getByRole("button", { name: "Menu" }));

    const drawer = screen.getByRole("dialog");
    expect(drawer).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("link", { name: /Wordle/i })).toBeInTheDocument();
    expect(screen.getByText("Streak")).toBeInTheDocument();
  });

  it("moves focus into the drawer so the keyboard follows the eye", async () => {
    renderDrawer();
    await click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("closes on Escape and hands focus back to the burger", async () => {
    renderDrawer();
    const burger = screen.getByRole("button", { name: "Menu" });
    await click(burger);
    await press("Escape");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(burger).toHaveFocus();
  });

  it("closes on a click outside it", async () => {
    renderDrawer();
    await click(screen.getByRole("button", { name: "Menu" }));
    await click(screen.getByTestId("drawer-backdrop"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when a game is chosen, so the drawer never covers the board", async () => {
    renderDrawer();
    await click(screen.getByRole("button", { name: "Menu" }));
    await click(screen.getByRole("link", { name: /Guessr/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks the page behind it while open", async () => {
    renderDrawer();
    await click(screen.getByRole("button", { name: "Menu" }));
    expect(document.body.style.overflow).toBe("hidden");
    await press("Escape");
    expect(document.body.style.overflow).toBe("");
  });
});
