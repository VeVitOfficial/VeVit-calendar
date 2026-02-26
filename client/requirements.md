## Packages
date-fns | Required for complex calendar grid calculations and date formatting

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}

Tailwind Config - extend colors:
colors: {
  sidebar: {
    DEFAULT: "hsl(var(--sidebar-background))",
    foreground: "hsl(var(--sidebar-foreground))",
    border: "hsl(var(--sidebar-border))",
    accent: "hsl(var(--sidebar-accent))",
    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
  }
}

API expects JSON with stringified ISO dates, responses contain ISO strings that must be parsed to Date objects.
