const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory data store for cars
const cars = [
  { id: 1, make: 'BMW', model: 'M3 Competition', year: 2022, price: 75900, imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, make: 'Mercedes-Benz', model: 'C63 AMG', year: 2021, price: 82900, imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, make: 'Toyota', model: 'Corolla', year: 2018, price: 12000, imageUrl: 'https://picsum.photos/seed/toyota/400/240' },
  { id: 4, make: 'Honda', model: 'Civic', year: 2019, price: 14000, imageUrl: 'https://picsum.photos/seed/honda/400/240' },
];
let nextId = 5;

function renderPage() {
  const carCards = cars
    .map(
      (c) => `
    <article class="car-card">
      <img src="${c.imageUrl}" alt="${c.make} ${c.model}" />
      <div class="car-info">
        <h3>${c.year} ${c.make} ${c.model}</h3>
        <p class="price">$${c.price.toLocaleString()}</p>
        <form method="POST" action="/delete/${c.id}" class="inline">
          <button class="delete" aria-label="Delete ${c.make} ${c.model}">Delete</button>
        </form>
      </div>
    </article>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Divyans Car Market</title>
    <style>
      :root { --bg:#0b1020; --card:#11162a; --text:#e8ecf3; --muted:#a6b0c2; --accent:#5cc8ff; --danger:#ff6b6b; }
      * { box-sizing: border-box; }
      body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: radial-gradient(1200px 600px at 10% -20%, #1a2240, transparent), radial-gradient(800px 400px at 90% 0%, #1d2a4d, transparent), var(--bg); color: var(--text); animation: fadeIn .5s ease-out; }
      header { position: sticky; top: 0; backdrop-filter: saturate(1.2) blur(6px); background: rgba(11,16,32,0.7); border-bottom: 1px solid #1f2a4a; padding: 14px 18px; z-index: 10; }
      header h1 { margin:0; font-size: 22px; letter-spacing: 0.8px; background: linear-gradient(90deg, #6dd6ff, #c77dff); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .container { max-width: 960px; margin: 20px auto; padding: 0 16px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
      .car-card { background: linear-gradient(180deg, #121a32, #0f1630); border: 1px solid #1f2a4a; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.35); transition: transform .2s ease, box-shadow .2s ease; transform: translateY(8px); opacity: 0; animation: cardIn .6s ease forwards; }
      .car-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 12px 26px rgba(0,0,0,0.5); }
      .car-card img { display: block; width: 100%; height: 170px; object-fit: cover; filter: saturate(1.05); }
      .car-info { padding: 14px; }
      h3 { margin: 0 0 8px 0; font-size: 16px; }
      .price { margin: 0; color: var(--accent); font-weight: 800; letter-spacing: .2px; }
      form.inline { display: inline; }
      .delete { margin-top: 8px; padding: 6px 10px; background: linear-gradient(180deg, #ff9c9c, #ff6b6b); border: 1px solid #ff8787; color: white; border-radius: 10px; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2); }
      .panel { background: #0e1530; border: 1px solid #1f2a4a; border-radius: 16px; padding: 16px; margin-bottom: 18px; box-shadow: 0 6px 18px rgba(0,0,0,0.35); animation: slideDown .5s ease; }
      .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
      label { font-size: 12px; color: var(--muted); display:block; margin-bottom: 6px; }
      input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #233056; background: #0b132b; color: var(--text); }
      button.add { padding: 10px 14px; background: linear-gradient(180deg, #6dd6ff, #35b8f3); border: 1px solid #5cc8ff; color: #0b1020; font-weight: 800; border-radius: 12px; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,0.35); transition: transform .15s ease; }
      button.add:hover { transform: translateY(-2px); }
      footer { text-align:center; color: var(--muted); font-size:12px; padding: 24px 0 40px; }
      .empty { color: var(--muted); text-align:center; padding: 24px; border: 1px dashed #233056; border-radius: 10px; }

      @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      @keyframes slideDown { from { transform: translateY(-6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      @keyframes cardIn { from { transform: translateY(10px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    </style>
  </head>
  <body>
    <header>
      <h1>Divyans Car Market</h1>
    </header>
    <main class="container">
      <section class="panel">
        <h2 style="margin:0 0 10px 0; font-size:16px">List your car</h2>
        <form method="POST" action="/add">
          <div class="row">
            <div>
              <label for="make">Make</label>
              <input id="make" name="make" placeholder="e.g., Tesla" required />
            </div>
            <div>
              <label for="model">Model</label>
              <input id="model" name="model" placeholder="e.g., Model 3" required />
            </div>
            <div>
              <label for="year">Year</label>
              <input id="year" name="year" type="number" min="1980" max="2099" step="1" placeholder="2018" required />
            </div>
            <div>
              <label for="price">Price (USD)</label>
              <input id="price" name="price" type="number" min="0" step="500" placeholder="15000" required />
            </div>
            <div>
              <label for="imageUrl">Image URL</label>
              <input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." />
            </div>
          </div>
          <div style="margin-top:12px">
            <button class="add">Add Car</button>
          </div>
        </form>
      </section>

      <section>
        <div class="grid">
          ${carCards || '<div class="empty">No cars yet. Add your first listing!</div>'}
        </div>
      </section>
    </main>
    <footer>
      Built with Express. Data is in-memory and resets on restart.
    </footer>
  </body>
  </html>
  `;
}

app.get('/', (req, res) => {
  res.send(renderPage());
});

app.post('/add', (req, res) => {
  const { make, model, year, price, imageUrl } = req.body;
  if (!make || !model || !year || !price) {
    return res.status(400).send('Missing required fields.');
  }
  const car = {
    id: nextId++,
    make: String(make).trim(),
    model: String(model).trim(),
    year: Number(year),
    price: Number(price),
    imageUrl:
      imageUrl && String(imageUrl).trim()
        ? String(imageUrl).trim()
        : `https://picsum.photos/seed/${Date.now()}/400/240`,
  };
  cars.push(car);
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = cars.findIndex((c) => c.id === id);
  if (index !== -1) cars.splice(index, 1);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

