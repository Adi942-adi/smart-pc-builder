# Smart PC Builder

AI-assisted PC build optimizer that parses natural-language requirements, checks compatibility, compares parts, saves builds, and exports shareable PC configurations.

## Features

- Parses requests like `gaming PC under Rs 80,000 with RTX GPU and 32GB RAM`
- Optimizes compatible CPU, GPU, motherboard, RAM, storage, PSU, case, and cooler combinations
- Checks socket, memory type, PSU headroom, case clearance, and cooler support
- Shows product thumbnails, retailer search links, and per-part optimizer notes
- Saves builds locally with `localStorage`
- Compares any two saved builds by value/performance
- Copies summaries, creates shareable URLs, opens WhatsApp share, and supports print/PDF output
- Includes benchmark-style output for gaming, editing, and workstation builds

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

Component specs are stored in `data.js`; editable prices live in `prices.json`.

Open `admin.html` locally to edit prices in the browser, save local overrides, or export a replacement `prices.json`.

## Tests

Run the optimizer checks with:

```bat
node tests\optimizer.test.js
```
