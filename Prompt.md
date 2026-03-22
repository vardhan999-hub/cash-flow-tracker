# Prompts.md

**Project:** Cash-Flow — Salary & Expense Tracker
**Week:** 2 | **Level:** Intermediate (Level 2)
**Intern:** Tadigadapa Harsha Vardhan

---

This file documents the AI prompts I used while building this project and what I personally learned from each one.

---

### Prompt 1 — Setting up the project

I started by asking the AI to help me set up the basic structure. I wanted to keep the files separate instead of writing everything in one file.

> "Build a salary and expense tracker using HTML, CSS and JavaScript in separate files."

Honestly I wasn't sure how the files talk to each other at first. After this I understood how to link a CSS and JS file inside HTML, and I started getting comfortable with `document.getElementById` to grab elements.

---

### Prompt 2 — Making data save on refresh

This was the part I was most confused about. I kept losing my data every time I refreshed the page and didn't know why.

> "How do I save my salary and expenses so they don't disappear when I refresh?"

This is where I learned about `localStorage`. The thing that tripped me up was that you can't just store an array directly — you have to convert it to a string first using `JSON.stringify()` and then convert it back using `JSON.parse()`. Once I understood that it made a lot of sense.

---

### Prompt 3 — Adding the chart

I wanted to visualize the data and the mission mentioned Chart.js so I asked how to use it without React since we're not allowed to use frameworks yet.

> "How do I add a Chart.js doughnut chart showing remaining balance vs total expenses without React?"

I learned how to load a library using a CDN link inside the HTML file. I also ran into a bug where the chart would break every time I added a new expense. The fix was to use `chart.update()` instead of creating a brand new chart each time.

---

### Prompt 4 — Delete button

I needed each expense in the list to have a delete button that removes it and instantly updates the balance.

> "Add a delete button next to each expense. Clicking it should remove that expense and update the balance."

At first the AI used `onclick` directly inside the HTML string which I later changed myself. I learned a better way called event delegation where you put one listener on the parent element and check which button was clicked using `e.target`. Much cleaner.

---

### Prompt 5 — Validation

I noticed that if I left the inputs empty or typed a negative number, it would still add a broken expense. I needed to block that.

> "Validate inputs — don't allow empty name or negative/zero amount. Show an error message."

I learned how `if (!name || !amount || amount <= 0)` works to catch all the bad cases. I also learned that input values come in as strings by default, so you have to wrap them in `Number()` otherwise `10 + 10` gives you `"1010"` instead of `20`. That was a fun bug to figure out.

---

### Prompt 6 — Budget warning

The last thing I added was the low balance alert for the Level 2 bonus.

> "If remaining balance goes below 10% of salary, turn the number red and show a warning message."

I used `classList.add()` and `classList.remove()` to toggle the red color dynamically. The math was simple — just check if `balance < salary * 0.1`.

---

### Things I changed myself after reviewing

After going through the generated code I made several changes on my own:

- Switched from inline `onclick` to event delegation — I read about it and it just makes more sense
- Replaced all the messy string concatenation with template literals, way easier to read
- Added `button:focus` styles because I noticed there was no visible focus state for keyboard users
- Added `cursor: pointer` on buttons — small thing but it felt wrong without it
- Added `-webkit-font-smoothing: antialiased` after noticing the fonts looked slightly off
- Tweaked the mobile padding in the media query
- The AI suggested `transition: all 0.2s ease` at one point but I didn't add it after reading that it can cause layout and performance issues

---

*I made sure I understood what every line of code does before including it.*