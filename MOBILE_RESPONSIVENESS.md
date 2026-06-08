# Mobile Responsiveness Checklist & Best Practices

This document outlines the systematic approach used to make the Launverse application fully mobile-responsive and provides guidelines for future development.

## 1. Step-by-Step Mobile Responsiveness Checklist

- [x] **Navigation:** Convert desktop sidebar into a mobile-friendly drawer. Ensure it closes automatically upon navigation.
- [x] **Header:** Adjust height and padding for smaller screens to maximize usable content area.
- [x] **Data Tables:**
    - Wrap complex tables in `overflow-x-auto`.
    - Implement a dual-layout strategy: use standard `<table>` for `md:` and larger screens, and a card-based list for mobile view.
- [x] **Forms:**
    - Use `grid-cols-1` by default for inputs to stack vertically on mobile.
    - Transition to multi-column layouts using `md:` or `lg:` breakpoints.
    - Convert inline tables (e.g., invoice items) into a responsive card list on mobile.
- [x] **Accessibility:**
    - Ensure hit targets for buttons and interactive inputs are at least 48x48px (`h-12` in Tailwind) on mobile.
    - Provide clear focus states and touch-friendly spacing.
- [x] **Modals:**
    - Ensure modals don't exceed screen height on mobile using `max-h-[90vh]`.
    - Enable `overflow-y-auto` for scrollable content within modals.
- [x] **Dark Mode:**
    - Verify that all responsive components (cards, lists) have appropriate `dark:` classes for background, text, and borders.

## 2. Best Practices for Handling Complex Data Tables

In a TypeScript environment, maintaining type safety while implementing responsive tables is crucial:

1.  **Dual-Layout Pattern:**
    ```tsx
    {/* Desktop View */}
    <div className="hidden md:block">
        <table className="w-full">...</table>
    </div>

    {/* Mobile View */}
    <div className="md:hidden divide-y">
        {data.map(item => (
            <DataCard key={item.id} data={item} />
        ))}
    </div>
    ```
2.  **Shared Types:** Always use shared TypeScript interfaces (e.g., `Product`, `Invoice`) for both table rows and mobile cards to ensure data consistency.
3.  **Action Consolidation:** Group actions (Edit, Delete, View) into a clear, touchable action bar at the bottom of each mobile card.
4.  **Information Hierarchy:** Display only critical information (ID, Name, Status, Total) on the mobile card at a glance, allowing users to tap for more details if needed.

## 3. Core Architecture Principles

- **Mobile-First:** Always write base Tailwind classes for mobile and use `sm:`, `md:`, `lg:` for larger screens.
- **Strict Typing:** Never use `any`. Define clear interfaces for all component props and Inertia page data.
- **Inertia.js Optimization:** Use `setOpenMobile(false)` in sidebar components to ensure the UI feels snappy and integrated when navigating on mobile devices.
