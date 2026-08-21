import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RollingNumber from "./RollingNumber";

describe("RollingNumber", () => {
  it("reads out as one number, not a column of digits", () => {
    // Every digit is a ten-item reel on screen. Without this the value reaches a
    // screen reader as "0 1 2 3 4 5 6 7 8 9" once per digit.
    render(<RollingNumber value="1.33" />);
    expect(screen.getByLabelText("1.33")).toBeInTheDocument();
  });

  it("puts every digit on its own reel and offsets it to that digit", () => {
    const { container } = render(<RollingNumber value="507" />);
    const reels = container.querySelectorAll("[style*='translateY']");
    expect(reels).toHaveLength(3);
    expect(reels[0]).toHaveStyle({ transform: "translateY(-5em)" });
    expect(reels[1]).toHaveStyle({ transform: "translateY(-0em)" });
    expect(reels[2]).toHaveStyle({ transform: "translateY(-7em)" });
  });

  it("leaves separators alone — only digits roll", () => {
    const { container } = render(<RollingNumber value="$1,500" />);
    // "$" and "," are not on reels, so four reels for 1, 5, 0, 0.
    expect(container.querySelectorAll("[style*='translateY']")).toHaveLength(4);
    expect(container.textContent).toContain("$");
    expect(container.textContent).toContain(",");
  });
});

describe("rolling a translated string", () => {
  it("rolls the digits and leaves the unit alone", () => {
    // PointsLine feeds the whole rendered message in — "1,240 pts" — so the
    // number animates without splitting a translated string apart.
    const { container } = render(<RollingNumber value="1,240 pts" />);
    expect(container.querySelectorAll("[style*='translateY']")).toHaveLength(4);
    expect(screen.getByLabelText("1,240 pts")).toBeInTheDocument();
    expect(container.textContent).toContain("pts");
  });
});
