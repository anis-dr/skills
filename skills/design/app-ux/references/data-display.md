# Data display

## Dashboards

- A dashboard does one thing. Write its purpose in one sentence; the first screen of it answers that sentence. Delete widgets that do not serve it.
- Rank widgets high, medium or low. Place higher ones higher and further left.
- Each metric appears once in the app. A KPI tile shows the value, its change and a sparkline; a decorative icon is not information.
- Merge related widgets (a growth rate belongs in the revenue card) instead of spreading them over separate cards.
- Do not hide a primary list (tasks, alerts) behind a button. Give it a section with "View all" and "Add" in its header.
- Dense screens use smaller type: dashboard text stays at or below 24 px.

## Tables

- Format columns by data type:
  - Numbers are right-aligned with tabular figures.
  - Values from a fixed set (status, department) are chips.
  - Long text is truncated with an ellipsis and its full value is available on hover.
  - Rows with an actor show an avatar.
  - Inactive rows are dimmed.
- Tables with more than a handful of rows have search, filter and sort.
- Rows have hover and selected states. Selection reveals bulk actions.
- Time-ordered events (history, activity) render as a timeline, not a table whose first column is a timestamp.
- A list shown on a home screen keeps to about five fields per row and has a designed empty state.

## Cards and listings

- Show only the fields a user scans to choose (name, price, rating, location). The description and the rest go on the detail page.
- Group related fields: name with location, price with rating. Put the most important value biggest and the key number on the right.
- Show minor attributes as one row of icon plus value instead of labelled lines.
- Text and icons laid over a user image get a gradient scrim or a solid plate, so any image keeps them legible. Long titles truncate.

## Charts

- Pick the chart from the data:

| Data | Chart |
| --- | --- |
| Trend over time | Line chart with straight segments |
| Comparing items | Bar chart, one bar per category, each labelled (an icon or logo beside the bar helps) |
| Part of a whole | Donut or pie |
| Money in versus out | Diverging bars, in above the axis and out below |
| Regions | Shaded map with the numbers listed beside it |

- Every chart has a title, axis labels or direct value labels, horizontal gridlines and a summary number.
- Lines are not smoothed (smoothing hides where the peak is), and the latest data is not faded. Bars have flat or clearly ended tops.
- The number of bars matches the number of categories: 7 days is 7 bars.
- Offer a time range control (segmented buttons, or a dropdown when short on space). Business metrics can show the previous period as a gray comparison line, with a legend.
- Hovering a point or bar shows its exact value.
- When an aggregate hides individual items, offer a toggle to split it into series.
- Remove a chart that repeats numbers already shown on the screen.
- Series colors are distinct hues at equal perceived lightness (see color-and-type.md), not shades of the brand color and not grays.
