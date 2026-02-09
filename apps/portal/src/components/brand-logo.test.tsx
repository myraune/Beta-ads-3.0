import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrandLogo } from "./brand-logo";

describe("BrandLogo", () => {
  it("uses light (white) logo variants on dark surfaces", () => {
    render(
      <>
        <BrandLogo kind="horizontal" surface="dark" />
        <BrandLogo kind="mark" surface="dark" />
      </>
    );

    const horizontal = screen.getByAltText("Beta Ads logo");
    const mark = screen.getByAltText("Beta Ads mark");

    expect(horizontal).toHaveAttribute("src", expect.stringContaining("/brand/h-logo-light.svg"));
    expect(mark).toHaveAttribute("src", expect.stringContaining("/brand/brandmark-light.svg"));
  });

  it("uses dark logo variants on light surfaces", () => {
    render(
      <>
        <BrandLogo kind="horizontal" surface="light" />
        <BrandLogo kind="mark" surface="light" />
      </>
    );

    const horizontal = screen.getByAltText("Beta Ads logo");
    const mark = screen.getByAltText("Beta Ads mark");

    expect(horizontal).toHaveAttribute("src", expect.stringContaining("/brand/h-logo-dark.svg"));
    expect(mark).toHaveAttribute("src", expect.stringContaining("/brand/brandmark-dark.svg"));
  });

  it("falls back to light asset if source fails", () => {
    render(<BrandLogo kind="horizontal" surface="light" dataTestId="brand-logo-fallback" />);

    const logo = screen.getByTestId("brand-logo-fallback");
    expect(logo).toHaveAttribute("src", expect.stringContaining("/brand/h-logo-dark.svg"));

    fireEvent.error(logo);
    expect(logo).toHaveAttribute("src", expect.stringContaining("/brand/h-logo-light.svg"));
  });
});
