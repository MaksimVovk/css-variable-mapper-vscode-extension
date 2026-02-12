# CSS Variable Mapper

**CSS Variable Mapper** is a VS Code extension designed to bridge the gap between HEX colors and your design tokens. It automatically maps HEX codes to your CSS variables, providing seamless autocomplete and real-time visual feedback directly in your editor.

## Key Features

-   **Intelligent Autocomplete**: Simply type `#` to see a list of available variables mapped to that specific color.
-   **Color Decorators**: Real-time color square icons next to your `var(--your-variable)` for instant visual recognition.
-   **Hot Reload**: Automatically updates your palette and decorators whenever you modify the configuration file—no reload required.

## Quick Start

1. Create a `.cssmapperconfig` file in your project's root directory.
2. Define your color mappings in JSON format:

```json
{
  "#FFB7B2": ["var(--color-pastel-red)"],
  "#C7CEEA": ["var(--color-primary)", "var(--color-pastel-blue)"],
  "#E0BBE4": "var(--color-lavender)"
}