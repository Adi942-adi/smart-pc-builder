# PCPro Builder

AI-assisted PC build optimizer that turns natural-language requirements into compatible PC part lists.

## Features

- Parses requests like `gaming PC under ₹80,000 with RTX GPU and 32GB RAM`
- Optimizes compatible CPU, GPU, motherboard, RAM, storage, PSU, case, and cooler combinations
- Checks socket, memory type, PSU headroom, case clearance, and cooler support
- Saves builds locally with `localStorage`
- Compares saved builds by value/performance
- Copies summaries, creates shareable URLs, opens WhatsApp share, and supports print/PDF output

## Run Locally

Open `index.html` directly, or run:

```bat
run-pcpro.bat
```

Then visit:

```text
http://127.0.0.1:8765/index.html
```

## Data

Component data is stored in `data.js` and marked with a last-updated label in the UI.
